---
id: backtest-a-portfolio
name: Backtest a portfolio
category: screeners-tools
pack: research
type: workflow
description: Paano subukan ang isang portfolio gamit ang nakaraang datos at ano ang dapat suriin.
tags: [backtest, portfolio, risk]
version: 1.0.0
updated: 2026-10-28
related: [company-quick-check]
resources: [portfolio-visualizer, curvo, etfdb]
---

# Mga hakbang
1. Isulat muna ang mga patakaran: anong mga asset, gaano kalaki ang bawat isa, at gaano kadalas mag-rebalance.
2. Pumili ng tool (hal. Portfolio Visualizer; Curvo para sa mga European fund). verify: nag-iiba ang libreng features ng bawat tool.
3. Piliin ang panahon na may kasamang mahihirap na taon (hal. 2008, 2020, 2022), hindi lang ang magagandang taon.
4. Isama ang mga bayarin at gastos ng mga fund (expense ratio).
5. Tingnan hindi lang ang kita (CAGR) kundi pati ang **max drawdown** (pinakamalaking pagbagsak) at volatility.
6. Subukan sa iba't ibang yugto ng panahon at ihambing.
7. Itanong: kakayanin ko bang hawakan ito kapag bumagsak nang ganito?

# Mga limitasyon
- **Overfitting:** kapag pinaikot-ikot ang mga patakaran hanggang gumanda ang resulta, hindi na ito mapagkakatiwalaan.
- **Survivorship bias:** madalas na hindi kasama sa datos ang mga fund o kumpanyang nawala na.
- Hindi garantiya ng hinaharap ang nakaraang resulta.
- Maaaring hindi kasama ang buwis at bayarin sa pagbili at pagbenta.

General information lang ito, hindi financial advice.
