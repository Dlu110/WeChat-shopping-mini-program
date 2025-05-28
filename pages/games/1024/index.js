Page({
  data: {
    board: [],
    score: 0,
    bestScore: 0,
    isGameOver: false,
    isWin: false
  },

  onLoad() {
    // 从本地存储加载最高分
    const bestScore = wx.getStorageSync('bestScore1024') || 0;
    this.setData({ bestScore });
    this.initGame();
  },

  initGame() {
    const board = Array(4).fill().map(() => Array(4).fill(0));
    // 初始添加两个数字
    this.addRandomTile(board);
    this.addRandomTile(board);
    
    this.setData({
      board,
      score: 0,
      isGameOver: false,
      isWin: false
    });
  },

  addRandomTile(board) {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  },

  onTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },

  onTouchEnd(e) {
    if (this.data.isGameOver || this.data.isWin) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    
    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        this.moveRight();
      } else {
        this.moveLeft();
      }
    } else {
      if (deltaY > 0) {
        this.moveDown();
      } else {
        this.moveUp();
      }
    }
  },

  moveLeft() {
    const newBoard = this.data.board.map(row => this.mergeLine([...row]));
    this.updateBoard(newBoard);
  },

  moveRight() {
    const newBoard = this.data.board.map(row => this.mergeLine([...row].reverse()).reverse());
    this.updateBoard(newBoard);
  },

  moveUp() {
    const newBoard = this.transpose(this.data.board);
    const mergedBoard = newBoard.map(row => this.mergeLine([...row]));
    this.updateBoard(this.transpose(mergedBoard));
  },

  moveDown() {
    const newBoard = this.transpose(this.data.board);
    const mergedBoard = newBoard.map(row => this.mergeLine([...row].reverse()).reverse());
    this.updateBoard(this.transpose(mergedBoard));
  },

  transpose(board) {
    return board[0].map((_, i) => board.map(row => row[i]));
  },

  mergeLine(line) {
    // 移除空格
    let newLine = line.filter(cell => cell !== 0);
    
    // 合并相同的数字
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        this.setData({
          score: this.data.score + newLine[i]
        });
        newLine.splice(i + 1, 1);
      }
    }
    
    // 补充空格
    while (newLine.length < 4) {
      newLine.push(0);
    }
    
    return newLine;
  },

  updateBoard(newBoard) {
    // 检查是否有变化
    const hasChanged = JSON.stringify(newBoard) !== JSON.stringify(this.data.board);
    
    if (hasChanged) {
      this.addRandomTile(newBoard);
      this.setData({ board: newBoard });
      
      // 检查是否获胜
      if (this.checkWin()) {
        this.setData({ isWin: true });
        wx.showModal({
          title: '恭喜',
          content: '你赢了！要继续游戏吗？',
          showCancel: true,
          success: (res) => {
            if (!res.confirm) {
              this.initGame();
            }
          }
        });
      }
      
      // 检查是否游戏结束
      if (this.checkGameOver()) {
        this.setData({ isGameOver: true });
        // 更新最高分
        if (this.data.score > this.data.bestScore) {
          this.setData({ bestScore: this.data.score });
          wx.setStorageSync('bestScore1024', this.data.score);
        }
        wx.showModal({
          title: '游戏结束',
          content: `得分：${this.data.score}`,
          showCancel: false,
          success: () => {
            this.initGame();
          }
        });
      }
    }
  },

  checkWin() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.data.board[i][j] === 2048) {
          return true;
        }
      }
    }
    return false;
  },

  checkGameOver() {
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.data.board[i][j] === 0) {
          return false;
        }
      }
    }
    
    // 检查是否有可以合并的相邻格子
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = this.data.board[i][j];
        if (
          (i < 3 && current === this.data.board[i + 1][j]) ||
          (j < 3 && current === this.data.board[i][j + 1])
        ) {
          return false;
        }
      }
    }
    
    return true;
  },

  onRestart() {
    this.initGame();
  }
}); 