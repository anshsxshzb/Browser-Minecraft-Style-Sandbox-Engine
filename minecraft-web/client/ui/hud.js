export class HUD {
  constructor(container) {
    this.stats = document.createElement('div');
    Object.assign(this.stats.style, {
      position: 'absolute', top: '8px', left: '8px', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '6px 8px',
    });

    this.hotbar = document.createElement('div');
    Object.assign(this.hotbar.style, {
      position: 'absolute', left: '50%', bottom: '12px', transform: 'translateX(-50%)', display: 'flex', gap: '4px',
    });

    container.append(this.stats, this.hotbar);
  }

  update(player, hotbar) {
    this.stats.textContent = `XYZ ${player.position.x.toFixed(1)} ${player.position.y.toFixed(1)} ${player.position.z.toFixed(1)}`;
    this.hotbar.innerHTML = '';
    hotbar.inventory.slots.forEach((slot, i) => {
      const cell = document.createElement('div');
      cell.textContent = `${slot.block}:${slot.count}`;
      Object.assign(cell.style, {
        width: '72px', height: '24px', fontSize: '12px', color: '#fff', border: i === hotbar.selected ? '2px solid #ff0' : '1px solid #999',
        background: 'rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: '24px',
      });
      this.hotbar.appendChild(cell);
    });
  }
}
