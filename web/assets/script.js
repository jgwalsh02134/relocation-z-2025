document.addEventListener('DOMContentLoaded', () => {
  const RelocationApp = {
    // --- CONFIGURATION ---
    config: {
      appVersion: '2025-08-13',
      stateTTLHours: 24,
      assistantName: 'Lenny',
      backendBase: '',
      sellingAddress: '54 Collyer Pl, White Plains, NY',
      prospectAddress: '8 Loudonwood East, Loudonville, NY 12211',
      financials: {
        defaultSalePrice: 1128100,
        defaultMortgageBalance: 350000,
        defaultPurchasePrice: 750000,
        defaultDownPaymentPercent: 20,
        commissionRate: 0.05,
        nyStateTransferTaxRate: 0.004,
        nyCityTransferTaxRate: 0.01,
        attorneyFee: 3000,
        otherSellerFees: 500,
        mansionTaxThreshold: 1000000,
        mansionTaxRate: 0.01,
        mortgageRecordingTaxRate: 0.0125,
        otherBuyerClosingCostsRate: 0.015,
        interestRate: 0.065,
        loanTermYears: 30,
        propertyTaxRate: 0.022,
        homeInsuranceRate: 0.0035,
      },
      typewriterText: "Hello, I’m Lenny Lodge. I’ll guide you end to end. Ready for a quick snapshot to get us started?",
      lennyPoses: {
        onboarding: 'default_greeting',
        overview: 'map_pointing',
        scenario: 'thinking_advising',
        dashboard: 'map_pointing',
        checklistSeller: 'sold_sign',
        checklistBuyer: 'closing_day'
      },
      sellingAnchors: {
        zillowUrl: 'https://www.zillow.com/homedetails/54-Collyer-Pl-White-Plains-NY-10605/32982800_zpid/',
        zestimate: 1014200,
        beds: 6,
        baths: 4,
        sqft: 3569,
        yearBuilt: 1924
      },
      prospectAnchors: {
        zillowUrl: 'https://www.zillow.com/homedetails/8-Loudonwood-E-Loudonville-NY-12211/29697778_zpid/',
        listPrice: 449900,
        zestimate: 442100,
        beds: 3,
        baths: 3,
        sqft: 1508,
        yearBuilt: 1974,
        hoaMonthly: 383,
        taxesAnnual: 7325
      }
    },

    // --- STATE ---
    state: {
      currentView: 'onboarding-view',
      chosenScenario: null,
      sellerCosts: {},
      buyerCosts: {},
      marketData: {}
    },

    // --- DOM ELEMENTS ---
    elements: {
      views: {
        onboarding: document.getElementById('onboarding-view'),
        overview: document.getElementById('overview-view'),
        scenario: document.getElementById('scenario-view'),
        dashboard: document.getElementById('dashboard-view'),
      },
      inputs: {
        salePrice: document.getElementById('sale-price'),
        mortgageBalance: document.getElementById('mortgage-balance'),
        purchasePrice: document.getElementById('purchase-price'),
        downPaymentPercent: document.getElementById('down-payment-percent'),
      },
      outputs: {
        netProfit: document.getElementById('net-profit'),
        pitiEstimate: document.getElementById('piti-estimate'),
        dashboardIntro: document.getElementById('dashboard-intro'),
        ovSellAddress: document.getElementById('ov-sell-address'),
        ovBuyAddress: document.getElementById('ov-buy-address'),
        ovSaleRange: document.getElementById('ov-sale-range'),
        ovBuyRange: document.getElementById('ov-buy-range'),
        ovTaxSavings: document.getElementById('ov-tax-savings'),
        ovUtilityDelta: document.getElementById('ov-utility-delta'),
        ovSaleZestLine: document.getElementById('ov-sale-zest-line'),
        ovSaleZest: document.getElementById('ov-sale-zest'),
        ovSaleZestLink: document.getElementById('ov-sale-zest-link'),
        ovSellBB: document.getElementById('ov-sell-bb'),
        ovSellSqft: document.getElementById('ov-sell-sqft'),
        ovSellYear: document.getElementById('ov-sell-year'),
        ovBuyList: document.getElementById('ov-buy-list'),
        ovBuyZest: document.getElementById('ov-buy-zest'),
        ovBuyBB: document.getElementById('ov-buy-bb'),
        ovBuySqft: document.getElementById('ov-buy-sqft'),
        ovBuyYear: document.getElementById('ov-buy-year'),
        ovBuyHoa: document.getElementById('ov-buy-hoa'),
        ovBuyTaxes: document.getElementById('ov-buy-taxes'),
        ovNetProceeds: document.getElementById('ov-net-proceeds'),
        ovCashClose: document.getElementById('ov-cash-close'),
        ovPiti: document.getElementById('ov-piti'),
        ovDecisionHint: document.getElementById('ov-decision-hint'),
      },
      buttons: {
        startOnboarding: document.getElementById('start-onboarding-btn'),
        confirmScenario: document.getElementById('confirm-scenario-btn'),
        gotoScenario: document.getElementById('goto-scenario-btn'),
        reset: document.getElementById('reset-btn'),
        exportLenny: document.getElementById('btnExportLenny'),
        copyLennyPrompt: document.getElementById('btnCopyLennyPrompt'),
        ovEditBuyRange: document.getElementById('ov-edit-buy-range-btn'),
        ovBuySave: document.getElementById('ov-buy-save-btn'),
        ovBuyCancel: document.getElementById('ov-buy-cancel-btn'),
      },
      inputsInline: {
        ovBuyLow: document.getElementById('ov-buy-low-input'),
        ovBuyHigh: document.getElementById('ov-buy-high-input'),
      },
      anchors: {
        prospectLink: document.getElementById('ov-prospect-link')
      },
      scenarioCards: {
        sellFirst: document.getElementById('scenario-sell-first'),
        buyFirst: document.getElementById('scenario-buy-first'),
        contingent: document.getElementById('scenario-contingent'),
      },
      lennyImg: null,
      typewriter: document.getElementById('typewriter'),
      typewriterCursor: document.getElementById('typewriter-cursor'),
      sellerChecklistContainer: document.getElementById('seller-checklist-container'),
      buyerChecklistContainer: document.getElementById('buyer-checklist-container'),
      sellerProgress: document.getElementById('seller-progress'),
      buyerProgress: document.getElementById('buyer-progress'),
    },

    // --- CHARTS ---
    charts: {
      sellerChart: null,
      buyerChart: null,
    },

    // --- CHECKLIST DATA ---
    checklistData: {
      seller: [
        { id: 's1', title: "Conduct a Pre-Listing Inspection", what: "A pre-listing inspection is where you hire a licensed inspector to examine your home *before* you list it. This helps you identify potential issues on your own terms, avoiding surprises during the buyer's inspection.", how: ["**Find a Pro:** Search for a licensed Home Inspector in Westchester County. Look for certifications from organizations like ASHI or InterNACHI.", "**Schedule:** Contact a few inspectors to compare pricing and availability. The inspection will take 2-4 hours.", "**Review the Report:** You'll get a detailed report with photos. We'll go through it to categorize items into 'Must-Fix,' 'Good-to-Fix,' and 'Disclose-but-Don't-Fix'."], tip: "Addressing a major issue beforehand, or getting a quote for the repair, gives you negotiating power when an offer comes in." },
        { id: 's2', title: "Declutter & Stage Your Home", what: "Making your home look spacious, clean, and impersonal helps buyers envision themselves living there.", how: ["**Declutter:** Go room by room. A good rule is to pack up 50% of your personal items, like family photos and knick-knacks.", "**Donate/Dispose:** For items you don't want, I can provide contact info for local donation centers or junk removal services.", "**Deep Clean:** A professional deep clean is almost always worth the investment before photos are taken."], tip: "Rent a small, temporary storage unit. It's an affordable way to make your home feel significantly larger during showings." },
        { id: 's3', title: "Complete NYS Property Condition Disclosure", what: "This is a mandatory legal document in New York where you disclose known conditions of the property.", how: ["**Get the Form:** Your attorney will provide the official form. I have a link to a sample so you can see what it looks like.", "**Answer Honestly:** Answer every question based on your actual knowledge. If you don't know, 'Unknown' is a valid answer."], tip: "Many sellers in NY opt to give a $500 credit to the buyer in lieu of filling out the form to reduce potential liability. This is a strategic decision we can discuss with your attorney." }
      ],
      buyer: [
        { id: 'b1', title: "Secure Full Mortgage Pre-Approval", what: "This is the most critical first step. A pre-approval from a lender shows sellers you are a serious, qualified buyer.", how: ["**Gather Documents:** You'll need pay stubs, W-2s, tax returns, and bank statements.", "**Choose a Lender:** Compare rates from at least three lenders (banks, credit unions, mortgage brokers).", "**Complete Application:** The lender will review your finances and credit to determine how much you can borrow."], tip: "A full pre-approval is much stronger than a pre-qualification. It means the lender has actually verified your information." },
        { id: 'b2', title: "Find Your Buyer's Agent", what: "A great local agent is your expert guide and negotiator in the Colonie market.", how: ["**Get Referrals:** Ask for recommendations from friends or colleagues in the area.", "**Interview Agents:** Talk to a few agents to find someone you connect with and who understands your specific needs.", "**Sign an Agreement:** You'll sign a buyer-broker agreement to formalize the relationship."], tip: "Look for an agent who is a full-time professional and has a deep understanding of the specific neighborhoods you're interested in." },
        { id: 'b3', title: "Understand NYS STAR Program", what: "The NYS School Tax Relief (STAR) program provides a partial exemption from school property taxes for eligible homeowners.", how: ["**Check Eligibility:** The Basic STAR exemption is for owner-occupied, primary residences where the owners' income is $500,000 or less.", "**Register:** You must register with the NYS Department of Taxation and Finance to receive the STAR credit."], tip: "This is a credit you receive as a check, not an upfront exemption on your tax bill. Make sure you register as soon as you close on your new home!" }
      ]
    },

    // --- INITIALIZATION ---
    init() {
      this.setupLenny();
      this.bindEventListeners();
      this.buildChecklists();
      this.restoreState();
      if (this.state.currentView === 'onboarding-view') {
        this.runTypewriterEffect(this.config.typewriterText);
      }
      this.updateUI();
    },

    // --- EVENT BINDING ---
    bindEventListeners() {
      this.elements.buttons.startOnboarding.addEventListener('click', () => this.handleStartOnboarding());
      const startMobile = document.getElementById('start-onboarding-btn-mobile');
      if (startMobile) startMobile.addEventListener('click', () => this.handleStartOnboarding());
      if (this.elements.buttons.gotoScenario) this.elements.buttons.gotoScenario.addEventListener('click', () => this.switchView('scenario'));
      this.elements.buttons.confirmScenario.addEventListener('click', () => this.handleConfirmScenario());
      this.elements.buttons.reset.addEventListener('click', () => this.resetApp());

      Object.values(this.elements.scenarioCards).forEach(card => card.addEventListener('click', (e) => this.handleScenarioSelection(e)));
      Object.values(this.elements.inputs).forEach(input => input.addEventListener('input', () => this.updateUI()));

      // Lenny helpers
      this.elements.buttons.exportLenny.addEventListener('click', () => window.exportLennyLibrary?.());
      this.elements.buttons.copyLennyPrompt.addEventListener('click', () => navigator.clipboard.writeText(window.buildLennyPrompt ? window.buildLennyPrompt() : ''));

      // Tap-to-skip for typewriter
      const lennyBubble = document.getElementById('lenny-bubble');
      if (lennyBubble) lennyBubble.addEventListener('click', () => {
        if (!this.elements.typewriter || !this.elements.typewriterCursor) return;
        const targetText = String(this.config.typewriterText || '');
        const isTyping = this.elements.typewriterCursor.style.display !== 'none' && this.elements.typewriter.textContent.length < targetText.length;
        if (isTyping) {
          this.runTypewriterEffect(targetText, null, true);
        }
      });

      // Chat (lazy init)
      document.getElementById('open-lenny-chat')?.addEventListener('click', () => this.initChatUI());

      // Overview inline editor
      const editBtn = this.elements.buttons.ovEditBuyRange;
      const saveBtn = this.elements.buttons.ovBuySave;
      const cancelBtn = this.elements.buttons.ovBuyCancel;
      const editor = document.getElementById('ov-buy-range-editor');
      if (editBtn && editor) editBtn.addEventListener('click', () => {
        const md = this.state.marketData || {};
        const low = md.targetBuyRange?.[0] ?? this.config.financials.defaultPurchasePrice;
        const high = md.targetBuyRange?.[1] ?? this.config.financials.defaultPurchasePrice;
        if (this.elements.inputsInline.ovBuyLow) this.elements.inputsInline.ovBuyLow.value = low;
        if (this.elements.inputsInline.ovBuyHigh) this.elements.inputsInline.ovBuyHigh.value = high;
        editor.classList.remove('hidden');
      });
      if (cancelBtn && editor) cancelBtn.addEventListener('click', () => {
        editor.classList.add('hidden');
        const err = document.getElementById('ov-buy-edit-error');
        if (err) err.classList.add('hidden');
      });
      if (saveBtn && editor) saveBtn.addEventListener('click', () => {
        const low = parseFloat(this.elements.inputsInline.ovBuyLow?.value ?? '');
        const high = parseFloat(this.elements.inputsInline.ovBuyHigh?.value ?? '');
        const err = document.getElementById('ov-buy-edit-error');
        const valid = Number.isFinite(low) && Number.isFinite(high) && low > 0 && high > 0 && low <= high;
        if (!valid) {
          if (err) err.classList.remove('hidden');
          return;
        }
        if (!this.state.marketData) this.state.marketData = {};
        this.state.marketData.targetBuyRange = [Math.round(low), Math.round(high)];
        this.state.marketData.userEditedBuyRange = true;
        this.renderOverview();
        editor.classList.add('hidden');
        if (err) err.classList.add('hidden');
      });

      // Bottom wizard controls
      const prev = document.getElementById('btnPrev');
      const next = document.getElementById('btnNext');
      const order = ['onboarding','overview','scenario','dashboard'];
      const go = (delta) => {
        const key = (this.state.currentView || 'onboarding').replace('-view','');
        const idx = Math.max(0, Math.min(order.length-1, order.indexOf(key)+delta));
        const dest = order[idx];
        if (dest==='dashboard' && !this.state.chosenScenario) { this.switchView('scenario'); return; }
        this.switchView(dest);
      };
      prev?.addEventListener('click', () => go(-1));
      next?.addEventListener('click', () => {
        if (this.state.currentView.includes('onboarding')) return this.handleStartOnboarding();
        if (this.state.currentView.includes('scenario') && this.state.chosenScenario) return this.handleConfirmScenario();
        go(+1);
      });

      // Down payment chips
      const dp = this.elements.inputs.downPaymentPercent;
      document.querySelectorAll('#dp-chips .chip').forEach(ch => {
        ch.addEventListener('click', () => {
          document.querySelectorAll('#dp-chips .chip').forEach(x => x.dataset.on = "false");
          ch.dataset.on = "true";
          const v = ch.dataset.val;
          if (v === 'custom') { dp?.classList.remove('hidden'); dp?.focus(); }
          else { dp?.classList.add('hidden'); if (dp) dp.value = v; this.updateUI(); }
        });
      });
    },

    // --- CORE LOGIC ---
    switchView(viewName) {
      Object.values(this.elements.views).forEach(view => view.classList.add('hidden'));
      if (this.elements.views[viewName]) {
        this.elements.views[viewName].classList.remove('hidden');
        this.state.currentView = viewName;
        this.elements.buttons.reset.classList.toggle('hidden', viewName === 'onboarding');
        this.elements.buttons.exportLenny.classList.toggle('hidden', viewName !== 'dashboard');
        this.elements.buttons.copyLennyPrompt.classList.toggle('hidden', viewName !== 'dashboard');
        this.updateLennyPose(viewName.replace('-view', ''));
        if (typeof this.persistState === 'function') this.persistState();
        this.speakWithChips(viewName.replace('-view',''));
      }
    },
    
    resetApp() {
      this.switchView('onboarding');
      Object.values(this.elements.scenarioCards).forEach(c => c.classList.remove('selected'));
      this.elements.buttons.confirmScenario.disabled = true;
      this.elements.buttons.confirmScenario.classList.add('opacity-50', 'cursor-not-allowed');
      this.state.chosenScenario = null;
      document.querySelectorAll('.checklist-checkbox').forEach(c => c.checked = false);
      this.updateProgress();
      this.runTypewriterEffect(this.config.typewriterText);
      try { localStorage.removeItem('rz25_state'); } catch (_) {}
    },

    // --- HANDLERS ---
    async handleStartOnboarding() {
      this.runTypewriterEffect('Checking the latest market trends...', null, true);
      this.setOverviewSkeleton(true);
      try {
        await this.fetchLatestMarketData();
        this.renderOverview();
        this.switchView('overview');
      } catch (err) {
        console.error("Backend Error:", err);
        // Build a lightweight fallback so user still gets an overview
        const d = this.config.financials;
        const fallback = {
          typicalSaleRange: [Math.round(d.defaultSalePrice * 0.9), Math.round(d.defaultSalePrice * 1.1)],
          targetBuyRange: [Math.round(d.defaultPurchasePrice * 0.9), Math.round(d.defaultPurchasePrice * 1.1)],
          taxSavingsAnnual: 0,
          monthlyUtilityDelta: 0
        };
        this.state.marketData = fallback;
        this.renderOverview();
        this.switchView('overview');
      }
      this.setOverviewSkeleton(false);
    },

    handleScenarioSelection(e) {
      const card = e.currentTarget;
      Object.values(this.elements.scenarioCards).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      this.state.chosenScenario = card.id;
      this.elements.buttons.confirmScenario.disabled = false;
      this.elements.buttons.confirmScenario.classList.remove('opacity-50', 'cursor-not-allowed');
      if (typeof this.persistState === 'function') this.persistState();
    },

    handleConfirmScenario() {
      if (this.state.chosenScenario) {
        this.switchView('dashboard');
        const scenarioText = {
          'scenario-sell-first': 'the Safety-First Path',
          'scenario-buy-first': 'the Convenience Path',
          'scenario-contingent': 'the Balancing Act'
        }[this.state.chosenScenario];
        this.speakAsLenny(this.elements.outputs.dashboardIntro, `Your plan is based on ${scenarioText}. Everything here is interactive and will update as you make changes.`);
        this.updateUI();
        if (typeof this.persistState === 'function') this.persistState();
      }
    },

    // --- FINANCIAL CALCULATIONS ---
    calculateSellerCosts() {
      const { salePrice, mortgageBalance } = this.getFinancialInputs();
      const { commissionRate, nyStateTransferTaxRate, nyCityTransferTaxRate, attorneyFee, otherSellerFees } = this.config.financials;
      
      const commission = salePrice * commissionRate;
      const totalTransferTax = salePrice * (nyStateTransferTaxRate + nyCityTransferTaxRate);
      const totalClosingCosts = commission + totalTransferTax + attorneyFee + otherSellerFees;
      const netProfit = salePrice - totalClosingCosts - mortgageBalance;

      this.state.sellerCosts = { salePrice, mortgageBalance, commission, totalTransferTax, attorneyFee, otherSellerFees, totalClosingCosts, netProfit };
    },

    calculateBuyerCosts() {
      const { purchasePrice, downPaymentPercent } = this.getFinancialInputs();
      const { mansionTaxThreshold, mansionTaxRate, mortgageRecordingTaxRate, otherBuyerClosingCostsRate, interestRate, loanTermYears, propertyTaxRate, homeInsuranceRate } = this.config.financials;

      const downPayment = purchasePrice * (downPaymentPercent / 100);
      const loanAmount = purchasePrice - downPayment;
      const mansionTax = purchasePrice >= mansionTaxThreshold ? purchasePrice * mansionTaxRate : 0;
      const mortgageRecordingTax = loanAmount * mortgageRecordingTaxRate;
      const otherClosingCosts = loanAmount * otherBuyerClosingCostsRate;
      const totalClosingCosts = mansionTax + mortgageRecordingTax + otherClosingCosts;
      const cashToClose = downPayment + totalClosingCosts;

      const monthlyInterestRate = interestRate / 12;
      const numberOfPayments = loanTermYears * 12;
      const monthlyPrincipalAndInterest = loanAmount > 0 ? (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1) : 0;
      const monthlyTaxes = (purchasePrice * propertyTaxRate) / 12;
      const monthlyInsurance = (purchasePrice * homeInsuranceRate) / 12;
      const piti = monthlyPrincipalAndInterest + monthlyTaxes + monthlyInsurance;

      this.state.buyerCosts = { purchasePrice, downPayment, mansionTax, mortgageRecordingTax, otherClosingCosts, totalClosingCosts, cashToClose, piti };
    },

    getFinancialInputs() {
      return {
        salePrice: parseFloat(this.elements.inputs.salePrice.value) || 0,
        mortgageBalance: parseFloat(this.elements.inputs.mortgageBalance.value) || 0,
        purchasePrice: parseFloat(this.elements.inputs.purchasePrice.value) || 0,
        downPaymentPercent: parseFloat(this.elements.inputs.downPaymentPercent.value) || 0,
      };
    },

    // --- UI UPDATES ---
    updateUI() {
      this.calculateSellerCosts();
      this.calculateBuyerCosts();
      this.elements.outputs.netProfit.textContent = this.formatCurrency(this.state.sellerCosts.netProfit);
      this.elements.outputs.pitiEstimate.textContent = this.formatCurrency(this.state.buyerCosts.piti);
      this.updateCharts();
      // Keep overview in sync if it's visible
      if (this.state.currentView === 'overview') this.renderOverview();
      if (typeof this.persistState === 'function') this.persistState();
    },

    updateCharts() {
      const sellerData = {
        labels: ['Net Profit', 'Commission', 'Taxes', 'Mortgage Payoff', 'Other Fees'],
        datasets: [{ data: [Math.max(0, this.state.sellerCosts.netProfit), this.state.sellerCosts.commission, this.state.sellerCosts.totalTransferTax, this.state.sellerCosts.mortgageBalance, this.state.sellerCosts.attorneyFee + this.state.sellerCosts.otherSellerFees], backgroundColor: ['#4A5C6A', '#8B6E5A', '#A89A8E', '#6B6864'], borderColor: '#FDFCFB', borderWidth: 3 }]
      };
      const buyerData = {
        labels: ['Down Payment', 'Mortgage Tax', 'Mansion Tax', 'Other Costs'],
        datasets: [{ data: [this.state.buyerCosts.downPayment, this.state.buyerCosts.mortgageRecordingTax, this.state.buyerCosts.mansionTax, this.state.buyerCosts.otherClosingCosts], backgroundColor: ['#4A5C6A', '#8B6E5A', '#A89A8E', '#6B6864'], borderColor: '#FDFCFB', borderWidth: 3 }]
      };
      const chartOptions = {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${this.formatCurrency(c.parsed)}` } }
        }
      };
      if (!this.charts.sellerChart) this.charts.sellerChart = new Chart(document.getElementById('seller-chart').getContext('2d'), { type: 'doughnut', data: sellerData, options: chartOptions });
      else { this.charts.sellerChart.data = sellerData; this.charts.sellerChart.update(); }
      if (!this.charts.buyerChart) this.charts.buyerChart = new Chart(document.getElementById('buyer-chart').getContext('2d'), { type: 'doughnut', data: buyerData, options: chartOptions });
      else { this.charts.buyerChart.data = buyerData; this.charts.buyerChart.update(); }
    },

    // --- CHECKLISTS ---
    buildChecklists() {
      const createChecklistHTML = (item) => {
        const howToList = item.how.map(step => `<li>${step.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#3D3B38]'>$1</strong>')}</li>`).join('');
        return `
          <div class="border-t border-gray-200">
            <div class="checklist-item-header p-4 flex justify-between items-center group">
              <div class="flex items-center gap-3">
                <input type="checkbox" data-id="${item.id}" class="checklist-checkbox h-5 w-5 rounded border-gray-300 text-[#4A5C6A] focus:ring-[#4A5C6A]">
                <h5 class="font-semibold text-md group-hover:text-[#4A5C6A] transition">${item.title}</h5>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div class="checklist-item-body px-4 ml-8 border-l-2 border-gray-200">
              <p class="text-sm text-[#6B6864] mb-3">${item.what.replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>
              <ul class="list-disc list-inside text-sm space-y-2 mb-4 text-[#6B6864]">${howToList}</ul>
              <div class="bg-[#F8F7F4] p-3 rounded-md text-sm">
                <strong class="font-semibold text-[#8B6E5A]">Lenny’s Professional Insight:</strong> <span class="text-[#6B6864]">${item.tip}</span>
              </div>
            </div>
          </div>`;
      };

      this.checklistData.seller.forEach(item => { this.elements.sellerChecklistContainer.innerHTML += createChecklistHTML(item); });
      this.checklistData.buyer.forEach(item => { this.elements.buyerChecklistContainer.innerHTML += createChecklistHTML(item); });

      document.querySelectorAll('.checklist-item-header').forEach(header => {
        header.addEventListener('click', (e) => {
          if (e.target.type === 'checkbox') return;
          const body = header.nextElementSibling;
          const arrow = header.querySelector('svg');
          body.classList.toggle('open');
          arrow.classList.toggle('rotate-180');
        });
      });
      
      document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => this.updateProgress());
      });
    },

    updateProgress() {
      const sellerTasks = this.checklistData.seller.length;
      const buyerTasks = this.checklistData.buyer.length;
      let sellerCompleted = 0;
      let buyerCompleted = 0;
      
      document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
          if (checkbox.dataset.id.startsWith('s')) sellerCompleted++;
          else buyerCompleted++;
        }
      });
      
      const sellerProgress = sellerTasks > 0 ? (sellerCompleted / sellerTasks) * 100 : 0;
      const buyerProgress = buyerTasks > 0 ? (buyerCompleted / buyerTasks) * 100 : 0;
      
      this.elements.sellerProgress.style.width = `${sellerProgress}%`;
      this.elements.buyerProgress.style.width = `${buyerProgress}%`;

      if (sellerProgress === 100) this.updateLennyPose('checklistSeller');
      else if (buyerProgress === 100) this.updateLennyPose('checklistBuyer');
    },

    // --- API & DATA FETCHING ---
    async fetchLatestMarketData() {
      const fetchWithThrow = async (address) => {
        const base = (window.RelocationConfig && window.RelocationConfig.backendBase) || this.config.backendBase || '';
        const res = await fetch(`${base}/api/comps?address=${encodeURIComponent(address)}`);
        if (!res.ok) throw new Error(`Backend fetch failed for ${address} with status ${res.status}`);
        const data = await res.json();
        if (data.low == null || data.high == null) throw new Error(`Incomplete comps data for ${address}`);
        return data;
      };
      
      const sellingData = await fetchWithThrow(this.config.sellingAddress);
      const buyingData = await fetchWithThrow(this.config.prospectAddress);

      this.state.marketData = {
        typicalSaleRange: [sellingData.low, sellingData.high],
        targetBuyRange: [buyingData.low, buyingData.high],
        taxSavingsAnnual: Math.round(sellingData.taxes - buyingData.taxes),
        monthlyUtilityDelta: Math.round(buyingData.utilities - sellingData.utilities)
      };
    },

    // --- HELPERS & UTILITIES ---
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    },

    runTypewriterEffect(text, onComplete, immediate = false) {
      if (!this.elements.typewriter || !this.elements.typewriterCursor) return;
      
      this.elements.typewriterCursor.style.display = 'inline';
      this.elements.typewriter.innerHTML = '';
      
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (immediate || prefersReduced) {
        this.elements.typewriter.textContent = text;
        this.elements.typewriterCursor.style.display = 'none';
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      let i = 0;
      const type = () => {
        if (i < text.length) {
          this.elements.typewriter.innerHTML += text.charAt(i++);
          setTimeout(type, 35);
        } else {
          this.elements.typewriterCursor.style.display = 'none';
          if (typeof onComplete === 'function') onComplete();
        }
      };
      type();
    },

    speakAsLenny(targetEl, text) {
      if (!targetEl) return;
      targetEl.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-[#4A5C6A]/10 text-[#4A5C6A] text-xs font-semibold mr-2 align-middle">Lenny</span><span class="lenny-message-text"></span>`;
      const textSpan = targetEl.querySelector('.lenny-message-text');
      textSpan.textContent = String(text);
      targetEl.setAttribute('aria-live', 'polite');
      targetEl.setAttribute('aria-label', `Lenny says: ${text}`);
    },
    speakWithChips(stepKey) {
      const step = (window.LennyScripts && window.LennyScripts[stepKey]) || null; if (!step) return;
      const target = document.getElementById(
        stepKey==='onboarding' ? 'lenny-bubble' :
        stepKey==='overview'   ? 'lenny-overview' :
        stepKey==='scenario'   ? 'lenny-scenario' : 'dashboard-intro'
      );
      if (!target) return;
      const name = this.config.assistantName || 'Lenny';
      target.innerHTML = `
        <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-[#4A5C6A]/10 text-[#4A5C6A] text-xs font-semibold mr-2 assistant-name">${name}</span>
        <span>${step.text}</span>
        <div class="mt-3 flex flex-wrap gap-2">
          ${(step.chips||[]).map(c=>`<button class=\"chip px-3 py-2 rounded-lg border border-gray-300\" data-id=\"${c.id}\">${c.label}</button>`).join('')}
        </div>`;
      target.querySelectorAll('.chip').forEach(btn=>{
        btn.addEventListener('click', ()=> this.routeFromChip(stepKey, btn.dataset.id));
      });
    },
    routeFromChip(stepKey, id) {
      if (stepKey==='onboarding' && id==='go_overview') this.switchView('overview');
      if (stepKey==='overview'   && id==='go_scenario') this.switchView('scenario');
      if (stepKey==='scenario') {
        const map = { pick_sell_first:'scenario-sell-first', pick_buy_first:'scenario-buy-first', pick_cont:'scenario-contingent' };
        document.getElementById(map[id])?.click();
        this.handleConfirmScenario();
      }
      if (stepKey==='dashboard') {
        if (id==='open_seller_check') document.querySelector('#seller-checklist-container .checklist-item-header')?.click();
        if (id==='open_buyer_check')  document.querySelector('#buyer-checklist-container .checklist-item-header')?.click();
        if (id==='tweak_payments')    document.getElementById('down-payment-percent')?.scrollIntoView({behavior:'smooth', block:'center'});
      }
    },

    setupLenny() {
      // Ensure an image exists and follow pose sizing rules; falling back to inline SVG may be handled elsewhere
      const img = document.createElement('img');
      img.id = 'lenny-img';
      img.alt = (this.config.assistantName || 'Lenny') + ' the Assistant';
      img.className = 'w-20 h-20 md:w-28 md:h-28 flex-shrink-0';
      this.elements.lennyImg = img;

      const hero = document.getElementById('lenny-hero');
      if (hero) hero.prepend(img);
      const nameEl = document.querySelector('#lenny-bubble .assistant-name');
      if (nameEl) nameEl.textContent = this.config.assistantName;
      this.updateLennyPose('onboarding');
    },

    updateLennyPose(key) {
      const poseName = this.config.lennyPoses[key] || this.config.lennyPoses.onboarding;
      const candidate = (key === 'onboarding') ? 'assets/images/lenny/lenny-full.png' : `assets/images/lenny/${poseName}.png`;
      const fallback = 'assets/images/lenny-lodge-1.svg';
      const containerByKey = {
        onboarding: document.getElementById('lenny-hero'),
        overview: document.getElementById('lenny-overview'),
        scenario: document.getElementById('lenny-scenario'),
        dashboard: document.getElementById('lenny-hero')
      };
      const target = containerByKey[key];
      if (target && this.elements.lennyImg && this.elements.lennyImg.parentElement !== target) {
        target.prepend(this.elements.lennyImg);
      }
      if (this.elements.lennyImg) {
        const sizeClasses = ['w-20','h-20','w-28','h-28','md:w-28','md:h-28','md:w-40','md:h-40','lg:w-48','lg:h-48'];
        this.elements.lennyImg.classList.remove(...sizeClasses);
        if (key === 'onboarding') this.elements.lennyImg.classList.add('w-28','h-28','md:w-40','md:h-40','lg:w-48','lg:h-48','flex-shrink-0');
        else this.elements.lennyImg.classList.add('w-20','h-20','md:w-28','md:h-28','flex-shrink-0');
      }
      const probe = new Image();
      probe.onload = () => { this.elements.lennyImg.src = candidate; };
      probe.onerror = () => {
        const try2 = new Image();
        try2.onload = () => { this.elements.lennyImg.src = fallback; };
        try2.onerror = () => { /* keep current */ };
        try2.src = fallback;
      };
      probe.src = candidate;
      this.elements.lennyImg.alt = `${this.config.assistantName} (${poseName.replace(/_/g, ' ')})`;
    },

    // --- OVERVIEW RENDER ---
    renderOverview() {
      const md = this.state.marketData || {};
      // Normalize targetBuyRange around current prospect list price if present and range looks unrealistic
      const listPrice = this.config.prospectAnchors?.listPrice;
      if (listPrice && !md.userEditedBuyRange) {
        const currentLow = md.targetBuyRange?.[0];
        const currentHigh = md.targetBuyRange?.[1];
        const looksOff = !Number.isFinite(currentLow) || !Number.isFinite(currentHigh) || currentHigh > listPrice * 1.3 || currentLow < listPrice * 0.7;
        if (looksOff) {
          md.targetBuyRange = [Math.round(listPrice * 0.95), Math.round(listPrice * 1.05)];
          this.state.marketData = md;
        }
      }
      const saleLow = md.typicalSaleRange?.[0] ?? this.config.financials.defaultSalePrice;
      const saleHigh = md.typicalSaleRange?.[1] ?? this.config.financials.defaultSalePrice;
      const buyLow = md.targetBuyRange?.[0] ?? (listPrice ? Math.round(listPrice * 0.95) : this.config.financials.defaultPurchasePrice);
      const buyHigh = md.targetBuyRange?.[1] ?? (listPrice ? Math.round(listPrice * 1.05) : this.config.financials.defaultPurchasePrice);
      const taxSave = md.taxSavingsAnnual ?? 0;
      const utilDelta = md.monthlyUtilityDelta ?? 0;

      // Purchase price chips (Low/Mid/High/Custom)
      const ppWrap = document.getElementById('pp-chips');
      if (ppWrap) {
        const mid = Math.round((buyLow + buyHigh) / 2);
        const opts = [
          {label:'Low',  val: buyLow},
          {label:'Mid',  val: mid},
          {label:'High', val: buyHigh},
          {label:'Custom', val:'custom'}
        ];
        ppWrap.innerHTML = opts.map(o =>
          `<button class="chip px-2 py-2 rounded-lg border border-gray-300" data-val="${o.val}">${o.label}${o.val!=='custom' ? ` ${this.formatCurrency(o.val)}`:''}</button>`
        ).join('');
        const pp = this.elements.inputs.purchasePrice;
        ppWrap.querySelectorAll('.chip').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            ppWrap.querySelectorAll('.chip').forEach(x=>x.dataset.on="false");
            btn.dataset.on="true";
            const v = btn.dataset.val;
            if (v === 'custom') { pp?.classList.remove('hidden'); pp?.focus(); }
            else { pp?.classList.add('hidden'); if (pp) pp.value = v; this.updateUI(); }
          });
        });
      }

      if (this.elements.outputs.ovSellAddress) this.elements.outputs.ovSellAddress.textContent = this.config.sellingAddress;
      if (this.elements.outputs.ovBuyAddress) this.elements.outputs.ovBuyAddress.textContent = this.config.prospectAddress;
      if (this.elements.outputs.ovSaleRange) this.elements.outputs.ovSaleRange.textContent = `${this.formatCurrency(saleLow)} – ${this.formatCurrency(saleHigh)}`;
      if (this.elements.outputs.ovBuyRange) this.elements.outputs.ovBuyRange.textContent = `${this.formatCurrency(buyLow)} – ${this.formatCurrency(buyHigh)}`;
      if (this.elements.outputs.ovTaxSavings) this.elements.outputs.ovTaxSavings.textContent = this.formatCurrency(taxSave);
      if (this.elements.outputs.ovUtilityDelta) this.elements.outputs.ovUtilityDelta.textContent = `${utilDelta >= 0 ? '+' : ''}${this.formatCurrency(utilDelta)}/mo`;
      if (this.elements.anchors?.prospectLink && this.config.prospectAnchors?.zillowUrl) {
        this.elements.anchors.prospectLink.href = this.config.prospectAnchors.zillowUrl;
      }
      // Buying detail anchors for credibility
      const pa = this.config.prospectAnchors || {};
      if (this.elements.outputs.ovBuyList && pa.listPrice) this.elements.outputs.ovBuyList.textContent = this.formatCurrency(pa.listPrice);
      if (this.elements.outputs.ovBuyZest && pa.zestimate) this.elements.outputs.ovBuyZest.textContent = this.formatCurrency(pa.zestimate);
      if (this.elements.outputs.ovBuyBB && (pa.beds || pa.baths)) this.elements.outputs.ovBuyBB.textContent = `${pa.beds || '?'} bd / ${pa.baths || '?'} ba`;
      if (this.elements.outputs.ovBuySqft && pa.sqft) this.elements.outputs.ovBuySqft.textContent = `${pa.sqft.toLocaleString()} sf`;
      if (this.elements.outputs.ovBuyYear && pa.yearBuilt) this.elements.outputs.ovBuyYear.textContent = `${pa.yearBuilt}`;
      if (this.elements.outputs.ovBuyHoa && pa.hoaMonthly != null) this.elements.outputs.ovBuyHoa.textContent = this.formatCurrency(pa.hoaMonthly) + '/mo';
      if (this.elements.outputs.ovBuyTaxes && pa.taxesAnnual != null) this.elements.outputs.ovBuyTaxes.textContent = this.formatCurrency(pa.taxesAnnual);
      // Optional: surface a Zestimate anchor for selling address
      const sa = this.config.sellingAnchors || {};
      if (this.elements.outputs.ovSaleZest && this.elements.outputs.ovSaleZestLink && sa.zestimate) {
        this.elements.outputs.ovSaleZest.textContent = this.formatCurrency(sa.zestimate);
        this.elements.outputs.ovSaleZestLink.href = sa.zillowUrl || '#';
      }
      if (this.elements.outputs.ovSellBB && (sa.beds || sa.baths)) this.elements.outputs.ovSellBB.textContent = `${sa.beds || '?'} bd / ${sa.baths || '?'} ba`;
      if (this.elements.outputs.ovSellSqft && sa.sqft) this.elements.outputs.ovSellSqft.textContent = `${sa.sqft.toLocaleString()} sf`;
      if (this.elements.outputs.ovSellYear && sa.yearBuilt) this.elements.outputs.ovSellYear.textContent = `${sa.yearBuilt}`;
      // Financial snapshot
      const net = this.state.sellerCosts?.netProfit ?? 0;
      const cashToClose = this.state.buyerCosts?.cashToClose ?? 0;
      const piti = this.state.buyerCosts?.piti ?? 0;
      if (this.elements.outputs.ovNetProceeds) this.elements.outputs.ovNetProceeds.textContent = this.formatCurrency(net);
      if (this.elements.outputs.ovCashClose) this.elements.outputs.ovCashClose.textContent = this.formatCurrency(cashToClose);
      if (this.elements.outputs.ovPiti) this.elements.outputs.ovPiti.textContent = this.formatCurrency(piti);
      // Decision hint
      if (this.elements.outputs.ovDecisionHint) {
        let hint = '';
        if (net <= 0) hint = 'Your net proceeds are tight or negative. Consider Safety-First (Sell First) to avoid financing gaps.';
        else if (cashToClose > net * 0.8) hint = 'Cash to close uses most of your net. Safety-First or a short rent-back can reduce risk.';
        else if (piti > (this.state.buyerCosts?.purchasePrice || 0) * 0.0007) hint = 'Monthly PITI looks high versus target price. Adjust down payment or range before continuing.';
        else hint = 'You appear positioned to proceed. Choose the strategy that best matches your risk tolerance and convenience.';
        this.elements.outputs.ovDecisionHint.textContent = hint;
      }
      this.setOverviewSkeleton(false);
    },

    // --- Lenny Chat (frontend) ---
    initChatUI(){
      if (this.elements.chat?.panel) {
        this.elements.chat.panel.classList.toggle('hidden');
        return;
      }
      if (!this.elements.chat) this.elements.chat = {};
      const panel = document.createElement('div');
      panel.className = 'fixed bottom-4 right-4 z-30 w-[min(92vw,380px)] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden';
      panel.innerHTML = `
        <div class="px-3 py-2 bg-[#4A5C6A] text-white text-sm font-semibold flex items-center justify-between">
          <span>Chat with Lenny</span>
          <button id="close-lenny-chat" class="text-white/80 hover:text-white">✕</button>
        </div>
        <div id="lenny-chat-messages" class="p-3 space-y-2 overflow-y-auto" style="max-height: 40vh;"></div>
        <div class="p-3 border-t border-gray-200 flex items-center gap-2">
          <input id="lenny-chat-input" class="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5C6A]" placeholder="Ask Lenny anything..." />
          <button id="lenny-chat-send" class="btn-primary px-3 py-2 rounded-md text-sm">Send</button>
        </div>
      `;
      document.body.appendChild(panel);
      this.elements.chat.panel = panel;
      this.elements.chat.input = panel.querySelector('#lenny-chat-input');
      this.elements.chat.messages = panel.querySelector('#lenny-chat-messages');
      panel.querySelector('#close-lenny-chat').addEventListener('click', ()=> panel.classList.add('hidden'));
      const sendBtn = panel.querySelector('#lenny-chat-send');
      const doSend = () => this.sendChatMessage();
      sendBtn.addEventListener('click', doSend);
      this.elements.chat.input.addEventListener('keydown', (e)=>{ if (e.key==='Enter') doSend(); });
      // Seed greeting
      this.appendChat('Lenny', 'How can I help? Ask about ranges, net, cash to close, or which strategy fits.');
    },
    appendChat(sender, text){
      if (!this.elements.chat?.messages) return;
      const row = document.createElement('div');
      const mine = sender === 'You';
      row.className = `text-sm ${mine ? 'text-right' : 'text-left'}`;
      row.innerHTML = `<span class="inline-block ${mine ? 'bg-[#4A5C6A] text-white' : 'bg-gray-100 text-[#3D3B38]'} px-3 py-2 rounded-lg max-w-[80%]">${text}</span>`;
      this.elements.chat.messages.appendChild(row);
      this.elements.chat.messages.scrollTop = this.elements.chat.messages.scrollHeight;
    },
    async sendChatMessage(){
      const input = this.elements.chat?.input;
      if (!input || !input.value.trim()) return;
      const msg = input.value.trim();
      input.value='';
      this.appendChat('You', msg);
      // Build context snapshot
      const ctx = {
        sellingAddress: this.config.sellingAddress,
        prospectAddress: this.config.prospectAddress,
        saleRange: this.state.marketData?.typicalSaleRange,
        buyRange: this.state.marketData?.targetBuyRange,
        netProceeds: this.state.sellerCosts?.netProfit,
        cashToClose: this.state.buyerCosts?.cashToClose,
        piti: this.state.buyerCosts?.piti
      };
      try{
        const base = (window.RelocationConfig && window.RelocationConfig.backendBase) || this.config.backendBase || '';
        const resp = await fetch(`${base}/api/chat`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ message: msg, context: ctx })
        });
        const data = await resp.json();
        const reply = data?.reply || 'Sorry, I had trouble answering that.';
        this.appendChat('Lenny', reply);
      } catch(err){
        this.appendChat('Lenny', 'The chat service is unavailable right now. Try again shortly.');
      }
    },

    // Skeleton toggling for overview
    setOverviewSkeleton(isLoading){
      const toggle = (sel, show) => document.querySelectorAll(sel).forEach(el => el.classList.toggle('hidden', !show));
      // show skeletons
      toggle('.ov-skel', !!isLoading);
      // hide text while loading
      if (this.elements.outputs.ovSellAddress) this.elements.outputs.ovSellAddress.classList.toggle('hidden', !!isLoading);
      if (this.elements.outputs.ovBuyAddress) this.elements.outputs.ovBuyAddress.classList.toggle('hidden', !!isLoading);
      if (this.elements.outputs.ovSaleRange) this.elements.outputs.ovSaleRange.classList.toggle('hidden', !!isLoading);
      if (this.elements.outputs.ovBuyRange) this.elements.outputs.ovBuyRange.classList.toggle('hidden', !!isLoading);
      if (this.elements.outputs.ovTaxSavings) this.elements.outputs.ovTaxSavings.classList.toggle('hidden', !!isLoading);
      if (this.elements.outputs.ovUtilityDelta) this.elements.outputs.ovUtilityDelta.classList.toggle('hidden', !!isLoading);
    },

    // --- PERSISTENCE ---
    persistState(){
      try {
        const payload = {
          version: this.config.appVersion,
          timestamp: Date.now(),
          currentView: this.state.currentView,
          chosenScenario: this.state.chosenScenario,
          inputs: this.getFinancialInputs(),
          marketData: this.state.marketData
        };
        localStorage.setItem('rz25_state', JSON.stringify(payload));
      } catch (_) {}
    },
    restoreState(){
      try {
        const params = new URLSearchParams(location.search);
        const forceOnboarding = params.get('start') === 'onboarding' || params.get('onboarding') === '1';
        const raw = localStorage.getItem('rz25_state');
        if (forceOnboarding || !raw) { this.switchView('onboarding'); return; }
        const data = JSON.parse(raw);
        const ageHrs = (Date.now() - (data.timestamp || 0)) / 36e5;
        const versionChanged = data.version !== this.config.appVersion;
        if (versionChanged || ageHrs > this.config.stateTTLHours) {
          localStorage.removeItem('rz25_state'); this.switchView('onboarding'); return;
        }
        if (data.inputs) {
          if (this.elements.inputs.salePrice) this.elements.inputs.salePrice.value = data.inputs.salePrice ?? this.config.financials.defaultSalePrice;
          if (this.elements.inputs.mortgageBalance) this.elements.inputs.mortgageBalance.value = data.inputs.mortgageBalance ?? this.config.financials.defaultMortgageBalance;
          if (this.elements.inputs.purchasePrice) this.elements.inputs.purchasePrice.value = data.inputs.purchasePrice ?? this.config.financials.defaultPurchasePrice;
          if (this.elements.inputs.downPaymentPercent) this.elements.inputs.downPaymentPercent.value = data.inputs.downPaymentPercent ?? this.config.financials.defaultDownPaymentPercent;
        }
        if (data.chosenScenario) {
          const el = document.getElementById(data.chosenScenario);
          if (el) {
            Object.values(this.elements.scenarioCards).forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            this.state.chosenScenario = data.chosenScenario;
            this.elements.buttons.confirmScenario.disabled = false;
            this.elements.buttons.confirmScenario.classList.remove('opacity-50', 'cursor-not-allowed');
          }
        }
        if (data.marketData) this.state.marketData = data.marketData;
        if (data.currentView && this.elements.views[data.currentView?.replace('-view','')] ? true : this.elements.views[data.currentView]) {
          const viewKey = this.elements.views[data.currentView] ? data.currentView : `${data.currentView}-view`;
          this.switchView(viewKey);
        }
      } catch (_) { this.switchView('onboarding'); }
    }
  };

  RelocationApp.init();
});


