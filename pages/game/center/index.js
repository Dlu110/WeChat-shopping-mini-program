Page({
  data: {
    games: [
      {
        id: 'sudoku',
        name: '数独',
        icon: '/assets/images/games/sudoku.png',
        description: '经典数独游戏，挑战你的逻辑思维',
        status: 'ready'
      },
      {
        id: '1024',
        name: '1024',
        icon: '/assets/images/games/1024.png',
        description: '合并相同数字，挑战2048',
        status: 'ready'
      },
      {
        id: 'minesweeper',
        name: '扫雷',
        icon: '/assets/images/games/minesweeper.png',
        description: '经典扫雷游戏，考验你的判断力',
        status: 'coming'
      },
      {
        id: 'airplane',
        name: '飞机大战',
        icon: '/assets/images/games/airplane.png',
        description: '经典飞机大战，体验射击快感',
        status: 'coming'
      },
      {
        id: 'tank',
        name: '坦克大战',
        icon: '/assets/images/games/tank.png',
        description: '经典坦克大战，重温童年回忆',
        status: 'coming'
      },
      {
        id: 'tree',
        name: '砍树游戏',
        icon: '/assets/images/games/tree.png',
        description: '休闲砍树游戏，放松心情',
        status: 'coming'
      }
    ]
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  onGameClick(e) {
    const { gameId, status } = e.currentTarget.dataset;
    if (status === 'coming') {
      wx.showToast({
        title: '游戏开发中，敬请期待',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/games/${gameId}/index`
    });
  }
}); 