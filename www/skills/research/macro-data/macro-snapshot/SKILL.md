---
id: macro-snapshot
name: Macro snapshot
category: macro-data
pack: research
type: workflow
description: Mabilis na pagsilip sa kalagayan ng ekonomiya gamit ang ilang pangunahing datos.
tags: [macro, fred, rates, inflation]
version: 1.0.0
updated: 2026-10-28
related: [company-quick-check]
resources: [fred, federal-reserve, ecb, bis, trading-economics]
---

# Layunin
Sa 10 hanggang 15 minuto, makuha ang pangkalahatang larawan ng ekonomiya bago pag-aralan ang isang merkado o kumpanya.

# Mga hakbang
1. Sa FRED, hanapin ang mga serye na ito (verify: i-check ang eksaktong pangalan sa site):

| Series | Ano ito |
|---|---|
| `FEDFUNDS` | Fed funds rate |
| `DGS10` | 10-year Treasury yield |
| `T10Y2Y` | Pagkakaiba ng 10-year at 2-year yield |
| `CPIAUCSL` | Consumer price index (implasyon) |
| `UNRATE` | Unemployment rate |
| `GDPC1` | Real GDP |

2. Para sa bawat isa, isulat ang pinakabagong halaga at ihambing sa isang taon na nakaraan.
3. Basahin ang pinakabagong pahayag ng Federal Reserve (o ECB para sa Europa).
4. Sa Trading Economics, ihambing ang ibang bansa kung kailangan.
5. Isulat ang 3 pangungusap: ano ang nagbago, ano ang direksyon ng interest rates, at ano ang panganib.

# Mga limitasyon
- May delay at minsan may rebisyon ang mga datos.
- Ang macro ay nagbibigay ng konteksto, hindi eksaktong oras ng pagbili o pagbenta.
- Ang BIS ay may mas malalim na mga ulat kung gusto mong mag-aral pa.

General information lang ito, hindi financial advice.
