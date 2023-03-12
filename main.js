import "./style.css";
import * as PIXI from "pixi.js";
import { OldFilmFilter } from "pixi-filters";
import { Entity } from "./player";
import { NormalizeVector } from "./utils";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  roundPixels: true,
  resizeTo: window,
  resolution: window.devicePixelRatio,
});

document.body.appendChild(app.view);

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

PIXI.Assets.add("charIdle", "/char_idle.png");
PIXI.Assets.add("charWalk", "/char_walk.png");
PIXI.Assets.add("charDamage", "/char_damage.png");
PIXI.Assets.add("testTile", "/test_tile.png");
PIXI.Assets.add("font32", "/font32.fnt");
PIXI.Assets.add("font24", "/font24.fnt");
const assetsPromise = PIXI.Assets.load([
  "charIdle",
  "charWalk",
  "charDamage",
  "font32",
  "font24",
]);

function loadSpriteSheet(texture, frameCount, frameWidth, frameHeight) {
  let frames = [];
  for (let i = 0; i < frameCount - 1; i++) {
    let frame = new PIXI.Texture(
      texture,
      new PIXI.Rectangle(0, i * frameHeight, frameWidth, frameHeight)
    );
    frames.push(frame);
  }
  return frames;
}

let sprite;
let idleTextures;
let walkTextures;
let damageTextures;

let entity;
let enemy;

var damagePool = [];

var isMoving = false;

let timerText;

assetsPromise.then((textures) => {
  const tile = PIXI.Texture.from("test_tile.png");
  const tilingSprite = new PIXI.TilingSprite(
    tile,
    app.screen.width,
    app.screen.height
  );
  tilingSprite.tileScale.x = 2;
  tilingSprite.tileScale.y = 2;
  tilingSprite.filters = [
    new OldFilmFilter({
      sepia: 0,
      noise: 0,
      scratch: 0,
      vignetting: 0.3,
      vignettingAlpha: 0.7,
      vignettingBlur: 0.3,
    }),
  ];
  app.stage.addChild(tilingSprite);

  idleTextures = loadSpriteSheet(textures.charIdle, 6, 32, 48);
  walkTextures = loadSpriteSheet(textures.charWalk, 8, 32, 48);
  damageTextures = loadSpriteSheet(textures.charDamage, 3, 32, 48);

  entity = new Entity(walkTextures, "ruben", 3200, 10);
  entity.x = app.screen.width / 2;
  entity.y = app.screen.height / 2 + entity.height / 2;
  entity.sprite.animationSpeed = 0.1;
  entity.sprite.play();
  app.stage.addChild(entity);

  enemy = new Entity(walkTextures);
  enemy.x = app.screen.width / 2 + 300;
  enemy.y = app.screen.height / 2 + entity.height / 2 - 100;
  enemy.sprite.animationSpeed = 0.1;
  enemy.sprite.play();
  app.stage.addChild(enemy);

  const damageContainer = new PIXI.Container();
  app.stage.addChild(damageContainer);
  for (var i = 0; i < 1000; i++) {
    const damageText = new PIXI.BitmapText("", {
      fontName: "font32",
    });
    damagePool.push(damageText);
    damageContainer.addChild(damageText);
    damagePool[i].visible = false;
  }
});

var activeDamages = [];
var damageDuration = 100;
app.ticker.add(function (delta) {
  for (var i = 0; i < activeDamages.length; i++) {
    var damageText = activeDamages[i];
    damageText.lifeTime -= delta;
    if (damageText.lifeTime < 0) {
      damageText.visible = false;
      activeDamages.splice(i, 1);
      i--;
    }
  }
});

let keys = {};
let mouse = 0;
const speed = 2;

window.addEventListener("keydown", function (event) {
  keys[event.key] = true;
  isMoving = true;
});
window.addEventListener("keyup", function (event) {
  keys[event.key] = false;
  isMoving = false;
});

window.addEventListener("mousedown", function (event) {
  mouse = event.buttons;
  if (mouse === 1) damage(enemy, 100);
  if (mouse === 4) heal(enemy, 100);
  
});
window.addEventListener("mouseup", function (event) {
  mouse = event.buttons;
});
window.addEventListener("mousemove", function (event) {
  if (mouse == 1) {
  }
});

var movementVector = { x: 0, y: 0 };
app.ticker.add(function () {
  if (keys["w"]) {
    movementVector.y = -1;
  }
  if (keys["a"]) {
    movementVector.x = -1;
    if (entity.sprite.scale.x > 0) entity.sprite.scale.x *= -1;
  }
  if (keys["s"]) {
    movementVector.y = 1;
  }
  if (keys["d"]) {
    movementVector.x = 1;
    if (entity.sprite.scale.x < 0) entity.sprite.scale.x *= -1;
  }

  if (JSON.stringify(movementVector) !== '{"x":0,"y":0}') {
    NormalizeVector(movementVector);
    entity.x += movementVector.x * speed;
    entity.y += movementVector.y * speed;
    movementVector.x = 0;
    movementVector.y = 0;
  }
});

function floatText(dmg, x, y, tint) {
  var damageText = damagePool.find((d) => !d.visible);
  if (!damageText) {
    damageText = activeDamages[0];
    activeDamages.splice(0, 1);
  }
  damageText.tint = tint;
  damageText.fontSize = 32;
  damageText.text = dmg;
  damageText.x = x;
  damageText.y = y;
  damageText.visible = true;
  damageText.lifeTime = damageDuration;
  activeDamages.push(damageText);
}

function damage(entity, value) {
  entity.setHP(-value);
  floatText("-" + value, entity.x, entity.y, "0xff0000");
  entity.bar.width = (230 / entity.health) * entity.currentHealth;
  entity.textHealth.text = Math.floor(entity.currentHealth) + "/" + entity.health;
}

function heal(entity, value) {
  entity.setHP(value);
  floatText("+" + value, entity.x, entity.y, "0x00ff00");
  entity.bar.width = (230 / entity.health) * entity.currentHealth;
  entity.textHealth.text = Math.floor(entity.currentHealth) + "/" + entity.health;
}
