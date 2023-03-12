import * as PIXI from "pixi.js";

export class Entity extends PIXI.Container {
  constructor(
    texture,
    name = "null",
    health = 9999,
    level = 99,
    showName = true,
    showBar = true
  ) {
    super();
    this.texture = texture;
    this.name = name;
    this.health = health;
    this.currentHealth = health;
    this.level = level;
    this.showName = showName;
    this.showBar = showBar;

    this.graphics();
  }

  setHP(value) {
    this.currentHealth += value;
    if (this.currentHealth < 0) this.currentHealth = 0;
    if (this.currentHealth > this.health) this.currentHealth = this.health; 
  }

  graphics() {
    this.text = new PIXI.BitmapText(this.name, {
      fontName: "font32",
    });
    this.text.roundPixels = true; 

    this.textHealth = new PIXI.BitmapText(this.currentHealth + "/" + this.health, {
      fontName: "font24",
    });

    this.textLevel = new PIXI.BitmapText('LVL ' + this.level, {
      fontName: "font24",
    });

    this.sprite = new PIXI.AnimatedSprite(this.texture);
    this.sprite.scale.set(4, 4);
    this.bar = new PIXI.Graphics();
    this.bgBar = new PIXI.Graphics();

    this.addChild(this.sprite);
    this.addChild(this.text);
    this.addChild(this.textHealth);
    this.addChild(this.textLevel);
    this.addChild(this.bgBar);
    this.addChild(this.bar);

    this.sprite.anchor.set(0.5, 0.5);
    this.text.anchor.set(0.5);

    this.bar.beginFill(0x00ff00);
    this.bar.drawRect(0, 0, 230, 10);
    this.bar.width = 230 / this.health * this.currentHealth;
    this.bar.endFill();
    this.bgBar.beginFill(0x0000000);
    this.bgBar.drawRect(0, 0, 230, 10);
    this.bgBar.endFill();

    this.text.position.set(0, this.sprite.height / 2 - 20);
    this.textHealth.position.set(
      -this.bgBar.width / 2,
      -this.sprite.height / 2 - 5
    );
    this.textLevel.position.set(
        this.bgBar.width / 2 - this.textLevel.width + 2,
        -this.sprite.height / 2 - 5
      );
    this.bgBar.position.set(-this.bgBar.width / 2, -this.sprite.height / 2 + 20);
    this.bar.position.set(-this.bgBar.width / 2, -this.sprite.height / 2 + 20);

    this.bar.visible = this.showBar;
    this.bgBar.visible = this.showBar;
    this.text.visible = this.showName;
  }
}
