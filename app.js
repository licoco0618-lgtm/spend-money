/* ==========================================================================
   🌈 萌萌彩虹記帳本 - Rainbow Cute Money Tracker Logic
   支援：按月觀看 (單月檢視)、手機專屬自適應版面、本機永久儲存與備份匯入
   ========================================================================== */

// 類別設定字典 (1. 正餐 2. 嘴饞 3. 其他)
const CATEGORIES = {
  meal: {
    id: 'meal',
    num: '1',
    name: '正餐',
    emoji: '🍱',
    color: '#ff793f',
    defaultNote: '早午晚餐'
  },
  snack: {
    id: 'snack',
    num: '2',
    name: '嘴饞',
    emoji: '🧋',
    color: '#e056fd',
    defaultNote: '點心手搖'
  },
  other: {
    id: 'other',
    num: '3',
    name: '其他',
    emoji: '🎈',
    color: '#22a6b3',
    defaultNote: '日常雜貨'
  }
};

// 可愛勵志語錄清單
const CUTE_QUOTES = [
  "✨ 「省錢是為了走更長遠的路，偶爾喝杯珍奶犒賞自己也很棒！」 💖",
  "🍱 「吃得飽飽，煩惱少少！正餐吃飽才有力氣努力！」 🌟",
  "🧋 「人生苦短，甜點和手搖就是靈魂的治癒劑！」 🧁",
  "🌈 「每一筆認真的記錄，都是對美好生活的溫柔照料！」 ✨",
  "💰 「一點一滴累積，你的彩虹夢想金庫正在長大喔！」 🌱",
  "🎈 「用心花錢買快樂，開開心心過好每一天！」 🌸"
];

// 應用程式狀態 (State)
let expenses = [];
let currentCategoryFilter = 'all'; // 'all' | 'meal' | 'snack' | 'other'
let viewMode = 'month'; // 'month' (一個月觀看一次) | 'all' (全部歷史)
let dashboardScope = 'month'; // 'month' | 'all'
let selectedYearMonth = getCurrentYearMonth(); // 格式 'YYYY-MM'
let isSoundEnabled = true;

// DOM 元素引用
const expenseForm = document.getElementById('expenseForm');
const amountInput = document.getElementById('amountInput');
const clearAmountBtn = document.getElementById('clearAmountBtn');
const noteInput = document.getElementById('noteInput');
const dateInput = document.getElementById('dateInput');

// 總額與儀表板元素
const totalAmountEl = document.getElementById('totalAmount');
const dashMonthLabel = document.getElementById('dashMonthLabel');
const totalTitleText = document.getElementById('totalTitleText');
const totalScopePill = document.getElementById('totalScopePill');
const scopeMonthBtn = document.getElementById('scopeMonthBtn');
const scopeAllBtn = document.getElementById('scopeAllBtn');

// 分類統計
const sumMealEl = document.getElementById('sumMeal');
const sumSnackEl = document.getElementById('sumSnack');
const sumOtherEl = document.getElementById('sumOther');
const pctMealEl = document.getElementById('pctMeal');
const pctSnackEl = document.getElementById('pctSnack');
const pctOtherEl = document.getElementById('pctOther');
const barMealEl = document.getElementById('barMeal');
const barSnackEl = document.getElementById('barSnack');
const barOtherEl = document.getElementById('barOther');

// 明細與月份控制器
const modeMonthTab = document.getElementById('modeMonthTab');
const modeAllTab = document.getElementById('modeAllTab');
const monthNavigatorCard = document.getElementById('monthNavigatorCard');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const thisMonthQuickBtn = document.getElementById('thisMonthQuickBtn');
const currentMonthLabel = document.getElementById('currentMonthLabel');
const monthPickerInput = document.getElementById('monthPickerInput');
const monthSubtotalBanner = document.getElementById('monthSubtotalBanner');
const monthSubtotalVal = document.getElementById('monthSubtotalVal');

// 清單與篩選
const expenseListEl = document.getElementById('expenseList');
const emptyStateEl = document.getElementById('emptyState');
const emptyTitleEl = document.getElementById('emptyTitle');
const emptyDescEl = document.getElementById('emptyDesc');
const recordCountBadge = document.getElementById('recordCountBadge');
const filterTabs = document.querySelectorAll('.filter-tab');

// 工具與按鈕
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');
const exportDataBtn = document.getElementById('exportDataBtn');
const importFileInput = document.getElementById('importFileInput');
const clearAllBtn = document.getElementById('clearAllBtn');
const quickChips = document.querySelectorAll('.quick-chip');
const quoteTextEl = document.getElementById('quoteText');
const confettiCanvas = document.getElementById('confettiCanvas');
const cuteToast = document.getElementById('cuteToast');

// ==========================================================================
// 1. 初始化與事件綁定
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 載入預設日期為今天
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  // 初始化選擇月份
  selectedYearMonth = today.slice(0, 7);
  monthPickerInput.value = selectedYearMonth;

  // 載入 LocalStorage 儲存之記錄
  loadExpenses();

  // 隨機切換可愛語錄
  rotateQuote();

  // 初始化音效設定
  const storedSound = localStorage.getItem('rainbow_sound_enabled');
  if (storedSound !== null) {
    isSoundEnabled = storedSound === 'true';
    updateSoundUI();
  }

  // 註冊事件監聽
  setupEventListeners();

  // 更新畫面
  renderApp();
});

function setupEventListeners() {
  // 表單送出
  expenseForm.addEventListener('submit', handleAddExpense);

  // 金額輸入框變化控制清空按鈕
  amountInput.addEventListener('input', () => {
    clearAmountBtn.style.display = amountInput.value ? 'flex' : 'none';
  });

  clearAmountBtn.addEventListener('click', () => {
    amountInput.value = '';
    clearAmountBtn.style.display = 'none';
    amountInput.focus();
    playPopSound(300);
  });

  // 快捷金額按鈕
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const addVal = parseInt(chip.dataset.add, 10) || 0;
      const currentVal = parseInt(amountInput.value, 10) || 0;
      amountInput.value = currentVal + addVal;
      clearAmountBtn.style.display = 'flex';
      playChimeSound(523.25); // Do
      
      chip.style.transform = 'scale(0.92)';
      setTimeout(() => { chip.style.transform = ''; }, 150);
    });
  });

  // 類別單選切換時更新備註提示詞
  const categoryRadios = document.querySelectorAll('input[name="expenseCategory"]');
  categoryRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      playBubbleSound();
      updatePlaceholder(e.target.value);
    });
  });

  // 統計範圍切換 (本月 vs 歷史總計)
  scopeMonthBtn.addEventListener('click', () => {
    dashboardScope = 'month';
    scopeMonthBtn.classList.add('active');
    scopeAllBtn.classList.remove('active');
    playPopSound(420);
    calculateAndRenderStats();
  });

  scopeAllBtn.addEventListener('click', () => {
    dashboardScope = 'all';
    scopeAllBtn.classList.add('active');
    scopeMonthBtn.classList.remove('active');
    playPopSound(420);
    calculateAndRenderStats();
  });

  // 檢視模式切換 (一個月觀看一次 vs 全部歷史紀錄)
  modeMonthTab.addEventListener('click', () => {
    viewMode = 'month';
    modeMonthTab.classList.add('active');
    modeAllTab.classList.remove('active');
    monthNavigatorCard.style.display = 'flex';
    monthSubtotalBanner.style.display = 'flex';
    playPopSound(440);
    renderApp();
  });

  modeAllTab.addEventListener('click', () => {
    viewMode = 'all';
    modeAllTab.classList.add('active');
    modeMonthTab.classList.remove('active');
    monthNavigatorCard.style.display = 'none';
    monthSubtotalBanner.style.display = 'none';
    playPopSound(440);
    renderApp();
  });

  // 月份控制器按鈕
  prevMonthBtn.addEventListener('click', () => {
    changeMonth(-1);
  });

  nextMonthBtn.addEventListener('click', () => {
    changeMonth(1);
  });

  thisMonthQuickBtn.addEventListener('click', () => {
    selectedYearMonth = getCurrentYearMonth();
    monthPickerInput.value = selectedYearMonth;
    playPopSound(500);
    renderApp();
    showToast(`🗓️ 已切換至本月 (${formatMonthReadable(selectedYearMonth)})`);
  });

  monthPickerInput.addEventListener('change', (e) => {
    if (e.target.value) {
      selectedYearMonth = e.target.value;
      playBubbleSound();
      renderApp();
    }
  });

  // 分類篩選 Tab 切換
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategoryFilter = tab.dataset.filter;
      playPopSound(460);
      renderExpenseList();
    });
  });

  // 音效切換
  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('rainbow_sound_enabled', isSoundEnabled);
    updateSoundUI();
    if (isSoundEnabled) {
      playSuccessChime();
      showToast('🔔 音效已開啟！✨');
    } else {
      showToast('🔕 音效已靜音');
    }
  });

  // 備份資料匯出
  exportDataBtn.addEventListener('click', handleExportData);

  // 匯入資料還原
  importFileInput.addEventListener('change', handleImportData);

  // 清空所有記錄
  clearAllBtn.addEventListener('click', handleClearAll);

  // 清單內點擊刪除按鈕 (事件委派)
  expenseListEl.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.item-delete-btn');
    if (deleteBtn) {
      const itemId = deleteBtn.dataset.id;
      handleDeleteItem(itemId);
    }
  });
}

function updatePlaceholder(categoryKey) {
  if (categoryKey === 'meal') {
    noteInput.placeholder = '例如：雞腿便當、排骨麵、鍋貼水餃...';
  } else if (categoryKey === 'snack') {
    noteInput.placeholder = '例如：珍珠奶茶微糖、泡芙、炸雞排...';
  } else {
    noteInput.placeholder = '例如：公車捷運、文具、生活雜貨...';
  }
}

// ==========================================================================
// 2. 月份操作輔助函數
// ==========================================================================
function getCurrentYearMonth() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function changeMonth(delta) {
  const [yearStr, monthStr] = selectedYearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + delta;

  if (month > 12) {
    year += 1;
    month = 1;
  } else if (month < 1) {
    year -= 1;
    month = 12;
  }

  selectedYearMonth = `${year}-${String(month).padStart(2, '0')}`;
  monthPickerInput.value = selectedYearMonth;
  playPopSound(440);
  renderApp();
}

function formatMonthReadable(yearMonthStr) {
  const [year, month] = yearMonthStr.split('-');
  return `${year} 年 ${parseInt(month, 10)} 月`;
}

// ==========================================================================
// 3. 核心功能：新增消費項目
// ==========================================================================
function handleAddExpense(e) {
  e.preventDefault();

  const selectedCategory = document.querySelector('input[name="expenseCategory"]:checked').value;
  const amount = parseFloat(amountInput.value);
  const note = noteInput.value.trim();
  const date = dateInput.value || new Date().toISOString().split('T')[0];

  if (!amount || amount <= 0) {
    alert('請輸入大於 0 的正確金額唷！🌈');
    amountInput.focus();
    return;
  }

  const newExpense = {
    id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    category: selectedCategory,
    amount: Math.round(amount),
    note: note || CATEGORIES[selectedCategory].name,
    date: date,
    createdAt: Date.now()
  };

  // 存入陣列
  expenses.unshift(newExpense);
  saveExpenses();

  // 若使用者正在檢視月份，且新增項目的月份不同，貼心切換到該月份
  const expenseMonth = date.slice(0, 7);
  if (viewMode === 'month' && selectedYearMonth !== expenseMonth) {
    selectedYearMonth = expenseMonth;
    monthPickerInput.value = expenseMonth;
  }

  // 播放歡樂音效與彩虹紙屑
  playSuccessChime();
  triggerConfetti();
  showToast('💖 已成功記入彩虹帳本！已自動永久儲存 ✨');

  // 重置輸入
  amountInput.value = '';
  noteInput.value = '';
  clearAmountBtn.style.display = 'none';

  renderApp();
  rotateQuote();
}

// ==========================================================================
// 4. 刪除項目與清空重設
// ==========================================================================
function handleDeleteItem(id) {
  const item = expenses.find(x => x.id === id);
  if (!item) return;

  const categoryName = CATEGORIES[item.category]?.name || '消費';
  const confirmMsg = `確定要刪除這筆【${categoryName} $${item.amount}】的紀錄嗎？`;

  if (confirm(confirmMsg)) {
    expenses = expenses.filter(x => x.id !== id);
    saveExpenses();
    playPopSound(280);
    renderApp();
    showToast('🗑️ 紀錄已刪除');
  }
}

function handleClearAll() {
  if (expenses.length === 0) {
    alert('目前帳本已經是空的囉！🌸');
    return;
  }

  if (confirm('⚠️ 確定要重設帳本並清空所有記錄嗎？\n(建議可先點擊「備份紀錄」將檔案保存下來喔！🌈)')) {
    expenses = [];
    saveExpenses();
    playPopSound(200);
    renderApp();
    showToast('✨ 帳本已重設清空');
  }
}

// ==========================================================================
// 5. 資料存取、備份與還原 (LocalStorage & JSON File)
// ==========================================================================
function saveExpenses() {
  try {
    localStorage.setItem('rainbow_cute_expenses', JSON.stringify(expenses));
  } catch (err) {
    console.error('儲存失敗', err);
    alert('瀏覽器儲存空間不足，請確認未處於無痕限制模式！');
  }
}

function loadExpenses() {
  try {
    const raw = localStorage.getItem('rainbow_cute_expenses');
    if (raw) {
      expenses = JSON.parse(raw);
    } else {
      // 首次進入時提供溫馨示範資料
      const today = new Date().toISOString().split('T')[0];
      expenses = [
        {
          id: 'demo_1',
          category: 'meal',
          amount: 120,
          note: '招牌排骨便當加滷蛋 🍱',
          date: today,
          createdAt: Date.now() - 3600000
        },
        {
          id: 'demo_2',
          category: 'snack',
          amount: 65,
          note: '波霸珍珠奶茶微冰微糖 🧋',
          date: today,
          createdAt: Date.now() - 1800000
        }
      ];
      saveExpenses();
    }
  } catch (err) {
    console.error('載入失敗', err);
    expenses = [];
  }
}

// 匯出備份 JSON 檔案 (方便使用者隨時下載或傳到手機)
function handleExportData() {
  if (expenses.length === 0) {
    alert('目前還沒有任何消費紀錄可以備份喔！');
    return;
  }

  const exportObj = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalRecords: expenses.length,
    data: expenses
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `rainbow_money_backup_${new Date().toISOString().slice(0, 10)}.json`;
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`💾 備份檔案已下載 (${filename})！資料永不丟失 ✨`);
  playPopSound(520);
}

// 匯入 JSON 檔案還原
function handleImportData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      const importedList = Array.isArray(parsed) ? parsed : (parsed.data || []);

      if (!Array.isArray(importedList) || importedList.length === 0) {
        alert('匯入的檔案格式不正確或沒有紀錄！');
        return;
      }

      // 檢查欄位正確性
      const validItems = importedList.filter(item => item.amount && item.category && item.date);

      if (confirm(`確認要匯入 ${validItems.length} 筆消費紀錄嗎？\n(將與目前的紀錄合併儲存)`)) {
        // 合併去重複 id
        const existingIds = new Set(expenses.map(x => x.id));
        let addedCount = 0;
        validItems.forEach(item => {
          if (!existingIds.has(item.id)) {
            expenses.push(item);
            addedCount++;
          }
        });

        // 依日期重新排序
        expenses.sort((a, b) => (b.date > a.date ? 1 : -1));
        saveExpenses();
        renderApp();
        showToast(`🎉 成功匯入 ${addedCount} 筆新紀錄！`);
        playSuccessChime();
      }
    } catch (err) {
      alert('檔案解析失敗，請確認是否為正確的 JSON 備份檔！');
    } finally {
      importFileInput.value = ''; // 重設 input 以便下次觸發
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// 6. 畫面渲染與統計計算 (支援按月觀看與總計切換)
// ==========================================================================
function renderApp() {
  // 更新月份控制器文字
  currentMonthLabel.textContent = formatMonthReadable(selectedYearMonth);
  const [_, mPart] = selectedYearMonth.split('-');
  dashMonthLabel.textContent = `${parseInt(mPart, 10)}月`;

  calculateAndRenderStats();
  renderExpenseList();
}

function calculateAndRenderStats() {
  // 決定統計資料集：本月統計 (dashboardScope === 'month') 還是歷史總計 (dashboardScope === 'all')
  const targetDataset = dashboardScope === 'month'
    ? expenses.filter(item => item.date.startsWith(selectedYearMonth))
    : expenses;

  if (dashboardScope === 'month') {
    totalScopePill.textContent = 'MONTHLY EXPENSES';
    totalTitleText.textContent = `【${formatMonthReadable(selectedYearMonth)}】支出金額`;
  } else {
    totalScopePill.textContent = 'ALL-TIME EXPENSES';
    totalTitleText.textContent = '全歷史累積總支出金額';
  }

  let total = 0;
  let sumMeal = 0;
  let sumSnack = 0;
  let sumOther = 0;

  targetDataset.forEach(item => {
    const amt = Number(item.amount) || 0;
    total += amt;
    if (item.category === 'meal') sumMeal += amt;
    else if (item.category === 'snack') sumSnack += amt;
    else if (item.category === 'other') sumOther += amt;
  });

  // 數字滾動跳動動畫
  animateValue(totalAmountEl, total);
  sumMealEl.textContent = sumMeal.toLocaleString();
  sumSnackEl.textContent = sumSnack.toLocaleString();
  sumOtherEl.textContent = sumOther.toLocaleString();

  // 計算百分比
  const pctMeal = total > 0 ? Math.round((sumMeal / total) * 100) : 0;
  const pctSnack = total > 0 ? Math.round((sumSnack / total) * 100) : 0;
  const pctOther = total > 0 ? (100 - pctMeal - pctSnack) : 0;

  pctMealEl.textContent = `${pctMeal}%`;
  pctSnackEl.textContent = `${pctSnack}%`;
  pctOtherEl.textContent = `${pctOther}%`;

  // 更新彩色進度條長度
  barMealEl.style.width = `${pctMeal}%`;
  barMealEl.title = `1. 正餐: $${sumMeal} (${pctMeal}%)`;

  barSnackEl.style.width = `${pctSnack}%`;
  barSnackEl.title = `2. 嘴饞: $${sumSnack} (${pctSnack}%)`;

  barOtherEl.style.width = `${pctOther}%`;
  barOtherEl.title = `3. 其他: $${sumOther} (${pctOther}%)`;
}

// 渲染明細清單 (依照「一個月觀看一次」或「全部」以及「分類 Tab」篩選)
function renderExpenseList() {
  // 1. 先按時間模式篩選 (月檢視 vs 全部)
  let timeFiltered = expenses;
  if (viewMode === 'month') {
    timeFiltered = expenses.filter(item => item.date.startsWith(selectedYearMonth));
    
    // 計算該月的小計
    const monthTotal = timeFiltered.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    monthSubtotalVal.textContent = `$${monthTotal.toLocaleString()} 元`;
  }

  // 2. 再按分類 Tab 篩選 (全部 / 正餐 / 嘴饞 / 其他)
  const finalFiltered = timeFiltered.filter(item => {
    if (currentCategoryFilter === 'all') return true;
    return item.category === currentCategoryFilter;
  });

  recordCountBadge.textContent = `${finalFiltered.length} 筆記錄`;

  if (finalFiltered.length === 0) {
    expenseListEl.innerHTML = '';
    emptyStateEl.style.display = 'flex';

    if (viewMode === 'month') {
      emptyTitleEl.textContent = `${formatMonthReadable(selectedYearMonth)} 尚無紀錄～`;
      emptyDescEl.textContent = `這個月份還沒有任何開銷，或者試試切換上方的分類標籤喔！🌸`;
    } else {
      emptyTitleEl.textContent = '帳本目前空空如也～';
      emptyDescEl.textContent = '今天吃了什麼美食或買了什麼呢？趕快在上方記下一筆吧！✨';
    }
    return;
  }

  emptyStateEl.style.display = 'none';

  expenseListEl.innerHTML = finalFiltered.map(item => {
    const cat = CATEGORIES[item.category] || CATEGORIES.other;
    return `
      <li class="expense-item category-${item.category}" data-id="${item.id}">
        <div class="item-left">
          <div class="item-icon-bubble" aria-hidden="true">${cat.emoji}</div>
          <div class="item-info">
            <div class="item-title-row">
              <span class="item-category-tag">${cat.num}. ${cat.name}</span>
              <strong class="item-note">${escapeHtml(item.note)}</strong>
            </div>
            <span class="item-date">📅 ${item.date}</span>
          </div>
        </div>
        <div class="item-right">
          <span class="item-amount">$${Number(item.amount).toLocaleString()}</span>
          <button type="button" class="item-delete-btn" data-id="${item.id}" title="刪除這筆" aria-label="刪除這筆紀錄">
            🗑️
          </button>
        </div>
      </li>
    `;
  }).join('');
}

// 數字跳動平滑動畫
function animateValue(element, endVal) {
  const current = parseInt(element.textContent.replace(/,/g, ''), 10) || 0;
  if (current === endVal) return;

  const duration = 400;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(current + (endVal - current) * easeProgress);
    element.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = endVal.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

function rotateQuote() {
  const randomIndex = Math.floor(Math.random() * CUTE_QUOTES.length);
  quoteTextEl.textContent = CUTE_QUOTES[randomIndex];
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function updateSoundUI() {
  if (isSoundEnabled) {
    soundIcon.textContent = '🔔';
    soundText.textContent = '音效開啟';
    soundToggleBtn.classList.remove('muted');
  } else {
    soundIcon.textContent = '🔕';
    soundText.textContent = '音效靜音';
    soundToggleBtn.classList.add('muted');
  }
}

// 可愛 Toast 提示泡泡
let toastTimer = null;
function showToast(msg) {
  if (!cuteToast) return;
  cuteToast.textContent = msg;
  cuteToast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    cuteToast.classList.remove('show');
  }, 2600);
}

// ==========================================================================
// 7. 可愛 Web Audio API 音效生成器 (離線即時可用)
// ==========================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSuccessChime() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.22, 'sine', 0.12);
    }, idx * 75);
  });
}

function playChimeSound(freq) {
  if (!isSoundEnabled) return;
  playTone(freq, 0.18, 'sine', 0.1);
}

function playBubbleSound() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

function playPopSound(freq = 400) {
  if (!isSoundEnabled) return;
  playTone(freq, 0.08, 'triangle', 0.08);
}

function playTone(freq, duration, type = 'sine', volume = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (err) {
    // 忽略自動播放限制
  }
}

// ==========================================================================
// 8. 彩虹愛心與閃亮紙屑噴灑特效 (Confetti Particles)
// ==========================================================================
let confettiParticles = [];
let confettiAnimationId = null;

function triggerConfetti() {
  const canvas = confettiCanvas;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff7675', '#fab1a0', '#ffeaa7', '#55efc4', '#74b9ff', '#a29bfe', '#fd79a8'];
  const symbols = ['⭐', '💖', '✨', '🌸', '🍭'];

  confettiParticles = [];
  for (let i = 0; i < 45; i++) {
    confettiParticles.push({
      x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 180,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 12 - 4,
      gravity: 0.35,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      size: Math.random() * 12 + 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      symbol: Math.random() > 0.4 ? symbols[Math.floor(Math.random() * symbols.length)] : null,
      opacity: 1
    });
  }

  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
  }

  animateConfetti(ctx, canvas);
}

function animateConfetti(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let activeCount = 0;
  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.rotationSpeed;
    p.opacity -= 0.016;

    if (p.opacity > 0 && p.y < canvas.height + 50) {
      activeCount++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);

      if (p.symbol) {
        ctx.font = `${p.size * 1.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  });

  if (activeCount > 0) {
    confettiAnimationId = requestAnimationFrame(() => animateConfetti(ctx, canvas));
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

window.addEventListener('resize', () => {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});
