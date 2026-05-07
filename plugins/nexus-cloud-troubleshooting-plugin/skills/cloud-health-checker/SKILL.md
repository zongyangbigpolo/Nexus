---
name: cloud-health-checker
description: Check Azure, AWS, or GCP cloud provider health status for a region affected by an incident. Detects cloud provider from cluster name or user input, queries public status APIs, and returns a structured cloudHealthContext block for inclusion in triage reports.
---

# Cloud Health Checker Skill

Surface cloud-provider outages as a contributing or root cause during incident triage.

> **Key principle**: This skill adds context — it does NOT gate or short-circuit the investigation. Even when a cloud outage is confirmed, the agent MUST continue executing all remaining investigation phases. The cloud health status is surfaced prominently in reports to inform the on-call engineer.

---

## Phase CH-1: Cloud Provider Detection

### CH-1a. From cluster name

Inspect the cluster name to determine cloud provider:

| Cluster name pattern | Cloud | Example |
|---------------------|-------|---------|
| `*-aks-*` or `aks-*` | **Azure** | `prod-aks-eastus-cluster` |
| `*-eks-*` or `eks-*` | **AWS** | `staging-eks-us-east-1-cluster` |
| `*-gke-*` or `gke-*` | **GCP** | `dev-gke-us-central1-cluster` |
| No match | Ask user | — |

### CH-1b. From user input or environment

If no cluster name is available, determine from:
1. User-specified cloud provider
2. kubectl context name
3. Credential files (~/.kube, ~/.azure, ~/.aws)

### CH-1c. Region extraction

Extract region from cluster name or labels:

**Azure regions** (common):
| Code | Name |
|------|------|
| `eastus` | East US |
| `westus2` | West US 2 |
| `westeurope` | West Europe |
| `northeurope` | North Europe |
| `southeastasia` | Southeast Asia |
| `uksouth` | UK South |
| `centralus` | Central US |
| `japaneast` | Japan East |
| `australiaeast` | Australia East |

**AWS regions** (common):
| Code | Name |
|------|------|
| `us-east-1` | US East (N. Virginia) |
| `us-west-2` | US West (Oregon) |
| `eu-west-1` | EU (Ireland) |
| `eu-central-1` | EU (Frankfurt) |
| `ap-southeast-1` | Asia Pacific (Singapore) |
| `ap-northeast-1` | Asia Pacific (Tokyo) |

**GCP regions** (common):
| Code | Name |
|------|------|
| `us-central1` | Iowa |
| `us-east1` | South Carolina |
| `europe-west1` | Belgium |
| `asia-east1` | Taiwan |
| `asia-southeast1` | Singapore |

---

## Phase CH-2: Query Cloud Health Status APIs

All endpoints are public and require no authentication.

### CH-2a. Azure Status (RSS)

```bash
curl -s "https://azure.status.microsoft/en-us/status/feed/" -o /tmp/azure_status.xml
```

Parse RSS items — each `<item>` represents an active incident. If 0 items, all services are healthy.

### CH-2b. AWS Health Status

```bash
curl -s "https://health.aws.amazon.com/health/status.json" -o /tmp/aws_status.json
```

AWS uses: `0` = OK, `1` = performance issues, `2` = service disruption.

### CH-2c. GCP Status

```bash
curl -s "https://status.cloud.google.com/incidents.json" -o /tmp/gcp_status.json
```

Filter for `currently_affected_products` in the detected region.

---

## Phase CH-3: Filter for Relevant Services

Check services critical to Kubernetes and cloud-native workloads:

| Service Category | Azure | AWS | GCP |
|-----------------|-------|-----|-----|
| K8s managed | AKS | EKS | GKE |
| Container registry | ACR | ECR | Artifact Registry |
| Compute | Virtual Machines | EC2 | Compute Engine |
| Identity | Entra ID / AAD | IAM | Cloud IAM |
| DNS | Azure DNS | Route 53 | Cloud DNS |
| Load balancer | Azure LB | ELB/ALB/NLB | Cloud Load Balancing |
| Networking | VNet | VPC | VPC |
| Storage | Azure Storage | S3 | Cloud Storage |
| Secrets | Key Vault | Secrets Manager | Secret Manager |
| Monitoring | Azure Monitor | CloudWatch | Cloud Monitoring |

---

## Phase CH-4: Output cloudHealthContext

```json
{
  "cloudProvider": "Azure|AWS|GCP",
  "region": "<region-code>",
  "cloudHealthStatus": "HEALTHY|DEGRADED|OUTAGE|UNKNOWN",
  "affectedServices": [
    {
      "service": "<service-name>",
      "status": "<status>",
      "description": "<incident description>",
      "since": "<timestamp>"
    }
  ],
  "checkedAt": "<ISO8601>"
}
```

Include this block in the triage report under "### Cloud Provider Status".
    if data.get("error") == "unreachable" or data.get("incidents") is None:
        print(json.dumps([{"service": "Azure Status API", "status": "UNKNOWN",
                           "region": region_name, "incident": "RSS feed unreachable"}]))
        sys.exit(0)

    incidents = data.get("incidents", [])
    if not incidents:
        # Empty feed = all services healthy
        print(json.dumps([]))
        sys.exit(0)

    for item in incidents:
        title = item.get("title", "") if isinstance(item, dict) else str(item)
        description = item.get("description", "") if isinstance(item, dict) else ""
        combined = f"{title} {description}".lower()

        # Check if relevant service or target region is mentioned
        region_match = region_name.lower() in combined
        service_match = any(kw.lower() in combined for kw in AZURE_KEYWORDS)

        if service_match or region_match:
            # Classify severity from title keywords
            status = "ACTIVE INCIDENT"
            if any(w in combined for w in ["resolved", "mitigated", "restored"]):
                status = "RESOLVED"
            elif any(w in combined for w in ["investigating", "degraded", "performance"]):
                status = "DEGRADED"

            results.append({
                "service": title,
                "status": status,
                "region": region_name if region_match else "global",
                "incident": description[:200] if description else title
            })

elif cloud == "aws":
    for event in data.get("summary", []):
        svc = event.get("service_name", "")
        reg = event.get("region", "")
        status_code = event.get("status", 0)
        if any(s.lower() in svc.lower() for s in AWS_SERVICES):
            if region_name in reg or reg in ("", "global"):
                if status_code > 0:
                    results.append({
                        "service": svc,
                        "status": "ACTIVE INCIDENT" if status_code == 2 else "DEGRADED",
                        "region": reg or "global",
                        "incident": event.get("message", "")
                    })

print(json.dumps(results, indent=2))
```

Run: `python3 $env:TEMP/cloud_health_parse.py azure "East US"` (or `aws "us-east-1"`).

---

## Phase CH-4: Assess Overall Health Status

Based on the filtered results from CH-3:

| Condition | `cloudHealthStatus` |
|-----------|-------------------|
| No impacted services found | `HEALTHY` |
| 1+ service is `DEGRADED` / `Performance Issues` | `DEGRADED` |
| 1+ service is `Active Incident` / `Service Disruption` / status code 2 | `OUTAGE` |
| API unreachable or parse error | `UNKNOWN` |

**Correlation hint**: If `cloudHealthStatus = OUTAGE` or `DEGRADED` AND the impacted service is `Azure Kubernetes Service` or `Amazon EKS`, this is likely a direct contributing cause to the alert (pod evictions, container restarts, scheduling failures, service mesh disruptions). Note this in the report.

---

## Phase CH-5: Output — cloudHealthContext Block

Produce a structured context block in this exact format for use in the report templates:

```
## Cloud Provider Health
Cloud: <Azure | AWS>  |  Region: <region name>  |  Checked: <timestamp UTC>
Status: <HEALTHY | DEGRADED | OUTAGE | UNKNOWN>
Status Page: <https://azure.status.microsoft/en-us/status | https://health.aws.amazon.com/health/status>

<IF HEALTHY>
All relevant services (AKS/EKS, ACR/ECR, AAD/IAM, DNS, Load Balancer) are Operational in <region>.
No cloud-provider contribution to this alert.

<IF DEGRADED or OUTAGE — emit this banner prominently>
+---------------------------------------------------------+
| !! CLOUD PROVIDER <STATUS> DETECTED                    |
|                                                         |
| Cloud:   <Azure | AWS>                                  |
| Region:  <region name>                                  |
|                                                         |
| Impacted services:                                      |
| * <Service Name> — <STATUS> [<incident description>]   |
| * <Service Name> — <STATUS>                             |
|                                                         |
| This may be a contributing or root cause of the alert. |
| Continue full investigation — see findings below.       |
+---------------------------------------------------------+

| Service | Status | Region | Incident |
|---------|--------|--------|---------|
| <name>  | <status> | <region> | <description or "—"> |

<IF UNKNOWN>
Cloud health API was unreachable. Status is unknown.
Manual check: <statusPageUrl>
```

**Slack block** (embed this verbatim in the Slack report when OUTAGE or DEGRADED):

```
:cloud: *CLOUD PROVIDER <STATUS>* — _<Cloud> `<region>`_ has an active issue affecting _<comma-separated impacted services>_.
This may be a contributing or root cause. Full investigation continues below.
Status page: <<statusPageUrl>|<Cloud> Status>
```

When HEALTHY, emit in Slack:
```
:white_check_mark: *Cloud Health*: <Cloud> `<region>` — All relevant services Operational.
```

---

## Error Handling

| Failure mode | Action |
|---|---|
| API timeout (>15s) | Set `UNKNOWN`, note: "Status API timed out after 15s" |
| HTTP 4xx/5xx | Set `UNKNOWN`, note HTTP status code |
| JSON/XML parse error | Set `UNKNOWN`, log: "Response schema changed — manual check required" |
| Python script error | Set `UNKNOWN`, include Python traceback in report footnote |
| Azure RSS endpoint fails | Set `UNKNOWN`, provide manual link: `https://azure.status.microsoft/en-us/status` |
