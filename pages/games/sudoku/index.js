Page({
  data: {
    board: [], // 数独棋盘
    solution: [], // 完整解答
    initialBoard: [], // 初始棋盘
    selectedCell: null, // 当前选中的格子
    difficulty: 'medium', // 难度级别：easy, medium, hard
    timer: 0, // 计时器
    timerInterval: null, // 计时器间隔
    score: 0, // 得分
    hints: 3, // 提示次数
    isPaused: false, // 是否暂停
    mistakes: 0, // 错误次数
    maxMistakes: 3, // 最大错误次数
    gameOver: false, // 游戏是否结束
    gameWon: false, // 是否获胜
    difficultyOptions: [
      { value: 'easy', label: '简单' },
      { value: 'medium', label: '中等' },
      { value: 'hard', label: '困难' }
    ]
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    this.clearTimer();
    this.saveGameProgress();
  },

  onHide() {
    this.clearTimer();
    this.saveGameProgress();
  },

  // 初始化游戏
  initGame() {
    this.clearTimer();
    this.setData({
      board: [],
      solution: [],
      initialBoard: [],
      selectedCell: null,
      timer: 0,
      score: 0,
      hints: 3,
      mistakes: 0,
      gameOver: false,
      gameWon: false
    });

    // 生成数独
    const { board, solution } = this.generateSudoku(this.data.difficulty);
    this.setData({
      board,
      solution,
      initialBoard: JSON.parse(JSON.stringify(board))
    });

    // 开始计时
    this.startTimer();
  },

  // 生成数独
  generateSudoku(difficulty) {
    // 生成完整的数独解答
    const solution = this.generateSolution();
    
    // 根据难度移除数字
    const board = this.removeNumbers(solution, difficulty);
    
    return { board, solution };
  },

  // 生成完整的数独解答
  generateSolution() {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    this.solveSudoku(board);
    return board;
  },

  // 解数独算法
  solveSudoku(board) {
    const emptyCell = this.findEmptyCell(board);
    if (!emptyCell) return true;

    const [row, col] = emptyCell;
    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let num of numbers) {
      if (this.isValid(board, row, col, num)) {
        board[row][col] = num;
        if (this.solveSudoku(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  },

  // 根据难度移除数字
  removeNumbers(solution, difficulty) {
    const board = JSON.parse(JSON.stringify(solution));
    const cellsToRemove = {
      'easy': 30,
      'medium': 40,
      'hard': 50
    }[difficulty];

    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (board[row][col] !== 0) {
        board[row][col] = 0;
        removed++;
      }
    }
    return board;
  },

  // 检查数字是否有效
  isValid(board, row, col, num) {
    // 检查行
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }

    // 检查列
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }

    // 检查3x3方格
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  },

  // 查找空格子
  findEmptyCell(board) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return [i, j];
      }
    }
    return null;
  },

  // 打乱数组
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // 选择格子
  onCellClick(e) {
    if (this.data.gameOver || this.data.gameWon) return;
    
    const { row, col } = e.currentTarget.dataset;
    if (this.data.initialBoard[row][col] !== 0) return;

    this.setData({
      selectedCell: { row, col }
    });
  },

  // 输入数字
  onNumberInput(e) {
    if (!this.data.selectedCell || this.data.gameOver || this.data.gameWon) return;
    
    const { number } = e.currentTarget.dataset;
    const { row, col } = this.data.selectedCell;
    
    // 检查是否是初始数字
    if (this.data.initialBoard[row][col] !== 0) return;

    const newBoard = JSON.parse(JSON.stringify(this.data.board));
    newBoard[row][col] = number;

    // 检查是否正确
    if (number !== this.data.solution[row][col]) {
      this.setData({
        mistakes: this.data.mistakes + 1
      });

      if (this.data.mistakes >= this.data.maxMistakes) {
        this.gameOver();
        return;
      }

      wx.showToast({
        title: '数字不正确',
        icon: 'none'
      });
      return;
    }

    // 更新分数
    const score = this.calculateScore();
    
    this.setData({
      board: newBoard,
      score
    });

    // 检查是否完成
    if (this.checkWin()) {
      this.gameWon();
    }
  },

  // 计算得分
  calculateScore() {
    const baseScore = {
      'easy': 100,
      'medium': 200,
      'hard': 300
    }[this.data.difficulty];

    const timeBonus = Math.max(0, 1800 - this.data.timer) * 0.1;
    const mistakePenalty = this.data.mistakes * 50;
    
    return Math.floor(baseScore + timeBonus - mistakePenalty);
  },

  // 使用提示
  useHint() {
    if (this.data.hints <= 0 || !this.data.selectedCell) {
      wx.showToast({
        title: '没有可用的提示',
        icon: 'none'
      });
      return;
    }

    const { row, col } = this.data.selectedCell;
    const newBoard = JSON.parse(JSON.stringify(this.data.board));
    newBoard[row][col] = this.data.solution[row][col];

    this.setData({
      board: newBoard,
      hints: this.data.hints - 1
    });

    // 检查是否完成
    if (this.checkWin()) {
      this.gameWon();
    }
  },

  // 检查是否获胜
  checkWin() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.data.board[i][j] !== this.data.solution[i][j]) {
          return false;
        }
      }
    }
    return true;
  },

  // 游戏结束
  gameOver() {
    this.clearTimer();
    this.setData({
      gameOver: true
    });
    wx.showModal({
      title: '游戏结束',
      content: '错误次数已达上限',
      showCancel: false,
      success: () => {
        this.initGame();
      }
    });
  },

  // 游戏胜利
  gameWon() {
    this.clearTimer();
    this.setData({
      gameWon: true
    });
    wx.showModal({
      title: '恭喜',
      content: `你赢了！\n用时：${this.formatTime(this.data.timer)}\n得分：${this.data.score}`,
      showCancel: false,
      success: () => {
        this.initGame();
      }
    });
  },

  // 开始计时器
  startTimer() {
    this.clearTimer();
    const timerInterval = setInterval(() => {
      this.setData({
        timer: this.data.timer + 1
      });
    }, 1000);
    this.setData({ timerInterval });
  },

  // 清除计时器
  clearTimer() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
      this.setData({ timerInterval: null });
    }
  },

  // 格式化时间
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // 切换难度
  onDifficultyChange(e) {
    const difficulty = e.detail.value;
    this.setData({ difficulty });
    this.initGame();
  },

  // 暂停游戏
  togglePause() {
    const isPaused = !this.data.isPaused;
    this.setData({ isPaused });
    
    if (isPaused) {
      this.clearTimer();
    } else {
      this.startTimer();
    }
  },

  // 保存游戏进度
  saveGameProgress() {
    const gameState = {
      board: this.data.board,
      initialBoard: this.data.initialBoard,
      solution: this.data.solution,
      timer: this.data.timer,
      score: this.data.score,
      hints: this.data.hints,
      mistakes: this.data.mistakes,
      difficulty: this.data.difficulty
    };
    wx.setStorageSync('sudokuGameState', gameState);
  },

  // 加载游戏进度
  loadGameProgress() {
    const gameState = wx.getStorageSync('sudokuGameState');
    if (gameState) {
      this.setData({
        board: gameState.board,
        initialBoard: gameState.initialBoard,
        solution: gameState.solution,
        timer: gameState.timer,
        score: gameState.score,
        hints: gameState.hints,
        mistakes: gameState.mistakes,
        difficulty: gameState.difficulty
      });
      this.startTimer();
    }
  }
}); 