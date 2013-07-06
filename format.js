fs = require("fs")

newUser = function(n, p, email)
{
     user = {n: n, p: p, email: email, pli:{faction: "human", achievements: new Array(), id: world.id, dogKill: 0, property: new Array(), quests: [], level: {level: 1, xpCurrent: 95, xpMax: 100}, units: new Array(), inventory: [0, 1, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 2, 3, 2, 2, 2, 7], an: 1, wn: 0, target: false, skills: {attack: 5, woodCutting: 20, building: {"wood": 20, "stone": 10, "iron": 5}}, spells: [0, 1, 2, 3, 4, 5, 6, 8], spellBook: [0, 1, 2, 3, 4, 5, 6, 7], health: {"max": 100, "current": 100}, mana: {"max": 1000, "current": 1000}, options: [0, 1, 2, 3], talents: {"points": 5, "speed": 0, "attack": 0, "effect": 0}, rect: [2500, 2500, 10, 46], resources: {wood: 1000, stone: 1000, iron: 1000, gold: 1000}, speed: {"val":playerSpeed, "lastCheck": new Date().getTime()}}};
     world.id++;
     users.push(user);
     return true;
}

spawn = [2400, 2400, 200, 200]

collision = function(rectOne, rectTwo)
{
     return (rectOne[0] + rectOne[2] > rectTwo[0] && rectOne[0] < rectTwo[0] + rectTwo[2] && rectOne[1] + rectOne[3] > rectTwo[1] && rectOne[1] < rectTwo[1] + rectTwo[3])
}

World = function(startSize, things, spawns)
{
     this.startSize = startSize;
     this.things = things;
     this.objects = [];
     this.spawns = spawns;
     this.housePos = [];

     this.place = function(s, x, y)
     {
          chance = Math.round(Math.random()*this.things[this.spawns[s].thing].chance);
          if (chance == 0)
          {
               chance = Math.round(Math.random());
               offsetx = Math.round(Math.random()*10);
               if (chance == 0)
                    offsetx = offsetx * (-1);

               chance = Math.round(Math.random());
               offsety = Math.round(Math.random()*10);
               
               if (chance == 0)
                    offsety = offsety * (-1);

               pos = [x * this.things[this.spawns[s].thing].appart + offsetx, y * this.things[this.spawns[s].thing].appart + offsety];
               yes = true;
               
               for (h in this.housePos)
                    if ((Math.abs(this.housePos[h][0] - pos[0]) < 100 && Math.abs(this.housePos[h][1] - pos[1]) < 100) && this.things[this.spawns[s].thing].type == "tree")                                                            
                         yes = false;

               if (yes)                                        
                    this.objects.push({"subClass": this.things[this.spawns[s].thing].subClass, "pos": pos, "type": this.things[this.spawns[s].thing].type});

               if (this.things[this.spawns[s].thing].type == "house")
                    this.objects.push({"pos": [pos[0] + 20, pos[1] + this.things[this.spawns[s].thing].subClass.wh[1] - 20], "type": "Bill"})
          }
     }

     for (s in this.spawns)
          if (this.spawns[s].loc != "all")
          {
               for (x = this.spawns[s].loc[0]/this.things[this.spawns[s].thing].appart; x - this.spawns[s].loc[0]/this.things[this.spawns[s].thing].appart < this.spawns[s].loc[2]/this.things[this.spawns[s].thing].appart; x ++)
                    for (y = this.spawns[s].loc[1]/this.things[this.spawns[s].thing].appart; y - this.spawns[s].loc[1]/this.things[this.spawns[s].thing].appart < this.spawns[s].loc[3]/this.things[this.spawns[s].thing].appart; y ++)
                         this.place(s, x, y);
          }
          else
          {
               for (x = 0; x < this.startSize/this.things[this.spawns[s].thing].appart; x++)
                    for (y = 0; y < this.startSize/this.things[this.spawns[s].thing].appart; y++)
                         this.place(s, x, y);
          }                    
}

Npc = function(level, faction, n, health, rect, id, img, quests)
{
     this.faction = faction;
     this.n = n;
     this.level = level;
     this.health = health;
     this.rect = rect;
     this.id = id;
     this.img = img;
     this.quests = quests;
     this.type = "npc";
}

NpcS = function(level, faction, n, health, wh, img, quests)
{
     this.faction = faction;
     this.n = n;
     this.level = level;
     this.health = health;
     this.wh = wh;
     this.img = img;
     this.quests = quests;
     this.type = "npc";
}

realWorld = function(buffer)
{
     this.trees = new Array();
     this.spawnPoint = [2500, 2500];
     this.structures = new Array();
     this.guilds = new Array();
     this.enemies = new Array();
     this.npcs = new Array();
     this.rocks = new Array();
     this.size = buffer.startSize;
     this.spawns = buffer.spawns;
     this.id = 0;     

     for (s in this.spawns)
          this.spawns[s].thing = things[this.spawns[s].thing];
     
     for (i = 0; i < buffer.objects.length; i++)
     {
          if (buffer.objects[i].type == "tree")
          {
               this.trees.push(
               {
                    "stages": 
                    [
                         {"from": 100, "to":75, "img": [0, 0]},
                         {"from": 75, "to": 50, "img": [0, 1]},
                         {"from": 50, "to": 25, "img": [0, 2]},
                         {"from": 25, "to": 0, "img": [0, 3]}
                    ],
                    "rect": buffer.objects[i].pos.concat([141, 141]),
                    "health": {"max": 100, "current": 100},
                    "currentStage": 0,
                    "img": [0, 0],
                    "type": "tree",
                    "n": "Tree",
                    "collision": false,
                    "sd": "static",
                    "id": this.id
               });
               this.id++;
          }

          if (buffer.objects[i].type == "enemy")
          {
               this.enemies.push
               (
                    {
                         "rect": buffer.objects[i].pos.concat(buffer.objects[i].subClass.wh),
                         "img": buffer.objects[i].subClass.img,
                         "speed": buffer.objects[i].subClass.speed,
                         "health": buffer.objects[i].subClass.health,
                         "n": buffer.objects[i].subClass.n,
                         "level": buffer.objects[i].subClass.level,
                         "id": this.id,
                         "skills": buffer.objects[i].subClass.skills,
                         "drop": buffer.objects[i].subClass.drop,
                         "si": buffer.objects[i].subClass.si,
                         "limbs": buffer.objects[i].subClass.limbs,
                         "limbsO": buffer.objects[i].subClass.limbsO
                    }
               );
               this.id++;
          }
          
          if (buffer.objects[i].type == "house")
          {
               this.structures.push(
               {
                    rect: buffer.objects[i].pos.concat(buffer.objects[i].subClass.wh),
                    img: buffer.objects[i].subClass.img,
                    stages: buffer.objects[i].subClass.stages,
                    owner: buffer.objects[i].subClass.owner,
                    health: buffer.objects[i].subClass.health,
                    n: buffer.objects[i].subClass.n,   

                    currentStage: 1,
                    spawned: 0,
                    id: this.id
               });                                                                   
               this.id++;
          }                        
                         
/*          if (buffer.objects[i].type == "Bill")
          {              
               this.npcs.push(new Npc(Math.round(Math.random()*7 + 1), "neutral", "Bill", {"current": 100, "max": 100}, buffer.objects[i].pos.concat([10, 46]), this.id, [10, 0], undefined));
               this.id++;
          }              */

          if (buffer.objects[i].type == "npc")
          {              
               this.npcs.push(
               {
                    faction: buffer.objects[i].subClass.faction,
                    n: buffer.objects[i].subClass.n,
                    health: buffer.objects[i].subClass.health,
                    rect: buffer.objects[i].pos.concat(buffer.objects[i].subClass.wh),
                    id: this.id,
                    img: buffer.objects[i].subClass.img,
                    quests: buffer.objects[i].subClass.quests
               });
               this.id ++;
          }          
          
          if (buffer.objects[i].type == "stone")
          {
               this.rocks.push(
               {
                    type: "rock",
                    rect: buffer.objects[i].pos.concat([113, 108]),
                    img: [12, 0],
                    stages: [{"from": 200, "to": 0, "img": [12, 0]}],
                    health: {"max": 200, "current": 200},
                    collision: false,
                    sd: "static",
                    currentStage: 0,
                    id: this.id,
                    n: "Stone"
               });
               this.id ++;
          }
     }
}

Guild = function(args)
{
     var g = this;
     
     g.n = args.n;
     g.o = args.o;
     g.members = args.members;
     
     world.guilds.push(g);
}

Thing = function(type, appart, chance, groupMax, subClass)
{
     this.type = type;
     this.appart = appart;
     this.chance = chance;
     this.groupMax = groupMax;
     this.subClass = subClass;     
}

Enemy = function(level, n, img, wh, health, skills, speed, drop, si, limbs, limbsO)
{
     this.limbsO = limbsO;
     this.level = level;
     this.wh = wh;//
     this.img = img;//
     this.health = health;
     this.speed = speed;
     this.skills = skills;     
     this.drop = drop;
     this.si = si;
     this.n = n;
     this.limbs = limbs;
}

Building = function(img, wh, stages, rect, cost, health, spawner, tag, n) //building info
{
     this.wh = wh;
     this.img = img;
     this.rect = rect;
     this.stages = stages;
     this.cost = cost;
     this.health = health;
     this.spawner = spawner;
     this.tag = tag;
     this.n = n;
}


Limb = function(wh, offset, style)
{
     var l = this;
     
     l.offset = offset;
     l.wh = wh;
     l.style = style;
}

var things = 
[
     new Thing("enemy", 76, 10, 5, new Enemy
     (
          2,
          "Dog",
          [2, 0], 
          [40, 20],
          {"current": 100, "max": 100},
          {"attack": 5},
          {"val": 1.5, "lastCheck": 0},
          [
               {"br": 0, "dropChance": 3},
               {"br": 2, "dropChance": 1},
               {"br": 3, "dropChance": 5}
          ],
          [[2, 0], [2, 1]],
          {
               "armLeft": new Limb([3, 9], [11, 11], "rgb(60, 60, 0)"),
               "LegLeft": new Limb([3, 9], [11, 11], "rgb(60, 60, 0)"),
               "armRight": new Limb([3, 9], [37, 11], "rgb(60, 60, 0)"),
               "LegRight": new Limb([3, 9], [37, 11], "rgb(60, 60, 0)"),
          },          
          {
               "left": {"armLeft": [11, 11], "LegLeft": [11, 11], "armRight": [37, 11], "LegRight": [37, 11]},
               "right": {"armLeft": [2, 11], "LegLeft": [2, 11], "armRight": [28, 11], "LegRight": [28, 11]},
          }
          
     )), //0

   
     new Thing("tree", 141, 1, undefined, undefined), //1

     new Thing("house", 200, 10, undefined, new Building
     (
          [1, 0],
          [141, 170],
          [
               {"from": 0, "to": 50, "img":[1, 1], "maxUnits": 0, "interval": 10000},
               {"from": 50, "to": 1000000, "img":[1, 0], "maxUnits": 5, "interval": 50000}
          ],
          [10, 0, 0, 5],
          {"current": 100, "max": 100},
          false,
          undefined,
          "House"
     )), // 2

     new Thing("stone", 150, 15, undefined, undefined), //3

     new Thing("enemy", 40, 3, 5, new Enemy
     (
          5,
          "Bandit",
          [2, 2], 
          [10, 46],
          {"current": 150, "max": 150},
          {"attack": 7},
          {"val": 1.5, "lastCheck": 0},
          [
               {"br": 0, "dropChance": 1},
               {"br": 2, "dropChance": 1},
               {"br": 3, "dropChance": 5}
          ],
          [[2, 2], [2, 3]],
          {
               "armLeft": new Limb([4, 13], [3, 10], "rgb(50, 250, 0)"),
               "LegLeft": new Limb([4, 21], [3, 26], "rgb(40, 240, 140)"),
               "armRight": new Limb([4, 13], [3, 10], "rgb(50, 250, 0)"),
               "LegRight": new Limb([4, 21], [3, 26], "rgb(40, 240, 140)"),
          },
          {
               "left": {"armLeft": [3, 10], "LegLeft": [3 , 26], "armRight": [3, 10], "LegRight": [3, 26]},
               "right": {"armLeft": [3, 10], "LegLeft": [3, 26], "armRight": [3, 10], "LegRight": [3, 26]},
          }

     )), //4

     new Thing("house", 200, 5, undefined, new Building
     (
          [1, 3],
          [141, 170],
          [
               {"from": 0, "to": 50, "img":[1, 1], "maxUnits": 0, "interval": 10000},
               {"from": 50, "to": 1000000, "img":[1, 3], "maxUnits": 10, "interval": 50000}
          ],
          [10, 10, 2, 3],
          {"current": 1000, "max": 1000},
          false,
          undefined,
          "Town hall"
     )), // 5

     new Thing("npc", undefined, undefined, undefined, new NpcS
     (
          2,
          "neutral",
          "Noel",
          {"current": 60, "max": 60},
          [10, 46],
          [10, 0],
          []
     )) //6
];

var spawns = 
[
     {"thing": 2, "loc": "all"},
     {"thing": 0, "loc": "all"},
     {"thing": 1, "loc": "all"},
     {"thing": 3, "loc": "all"},
//     {"thing": 4, "loc": [2500, 2500, 300, 300]}
];

sliceHere = function(list, i)
{
     buffOne = list.slice(0, i);
     buffTwo = list.slice(i + 1);
     
     return buffOne.concat(buffTwo);         
}

Quest = function(n, check, complete, needed, give, description, xp)
{
     this.n = n;
     this.xp = xp;
     this.check = check;
     this.needed = needed;
     this.complete = complete;
     this.give = give;
     this.description = description;
}                           

var worldBuffer = new World (5000, things, spawns);

Town = function(owner, pos, map, w, offset, population)
{
     for (o = 0; o < worldBuffer.objects.length; o ++)
          if (worldBuffer.objects[o].pos[0] > pos[0] && worldBuffer.objects[o].pos[1] > pos[1] && worldBuffer.objects[o].pos[0] < pos[0] + w*map.length && worldBuffer.objects[o].pos[1] < pos[1] + w*map[0].length)
          {
               worldBuffer.objects = sliceHere(worldBuffer.objects, o);
               o --;
          }
          
     for (i in map)
          for (j in map[i])
               if (map[i][j] != "x")
                    worldBuffer.objects.push({"subClass": things[map[i][j]].subClass, "pos": [pos[0] + j*w + offset*Math.random(), pos[1] + i*w + offset*Math.random()], "type": things[map[i][j]].type})

     for (i = 0; i < population; i ++)
          worldBuffer.objects.push({"subClass": things[6].subClass, "pos": [pos[0] + Math.round(Math.random()*w*map.length), pos[1] + Math.round(Math.random()*w*map.length)], "type": "npc"})
}

Map = function(size, houseChance)
{
     this.size = size;
     this.map = [];
     this.row = [];
     this.houseChance = houseChance;

     if (this.size%2 == 0)
          this.size ++;
     
     for (i = 0; i < this.size; i ++)
          this.row.push("x");

     for (i = 0; i < this.size; i ++)
          this.map.push(this.row.slice());

     this.map[Math.round(this.size/2) - 1][Math.round(this.size/2) - 1] = 5;

     for (i = 0; i < this.size; i ++)
          for (j = 0; j < this.size; j ++)
               if (this.map[i][j] != 5)
                    if (Math.round(Math.random()*this.houseChance) != 0)
                         this.map[i][j] = 2;
}

//for (u = 0; u < 10; u ++)
     Town("neutral", [3000, 3000] /*[Math.random()*worldBuffer.startSize, Math.random()*worldBuffer.startSize]*/, new Map(3, 8).map, 200, 50, 3)

var world = new realWorld(worldBuffer);
var playerSpeed = 2;

world.units = new Array();
world.guilds = new Array();


King = new Npc(100, "human", "Human king", {"current": 1000, "max": 1000}, [2400, 2400, 10, 46], world.id, [10, 1], [new Quest("Collect wood", "woodCheck", "giveIron", 100, 100, "Collect 100 wood!", 50)]);
world.id++;

UndeadKing = new Npc(100, "undead", "High priest", {"current": 1000, "max": 1000}, [2000 + Math.round(Math.random()*500), 2000 + Math.round(Math.random()*500), 25, 46], world.id, [10, 3], [new Quest("Collect wood", "woodCheck", "giveIron", 100, 100, "Collect 100 wood!", 50)]);
world.id++;

DwarfKing = new Npc(100, "dwarf", "Dwarf king", {"current": 1000, "max": 1000}, [2000 + Math.round(Math.random()*500), 2000 + Math.round(Math.random()*500), 18, 28], world.id, [10, 2], [new Quest("Collect wood", "woodCheck", "giveIron", 100, 100, "Collect 100 wood!", 50)]);
world.id++;

OrcKing = new Npc(100, "orc", "Captain", {"current": 1000, "max": 1000}, [2000 + Math.round(Math.random()*500), 2000 + Math.round(Math.random()*500), 10, 46], world.id, [10, 4], [new Quest("Collect wood", "woodCheck", "giveIron", 100, 100, "Collect 100 wood!", 50)]);
world.id++;

Jay = new Npc(5, "neutral", "Jay", {"current": 100, "max": 100}, [2500, 2450, 10, 46], world.id, [10, 0], [new Quest("Kill dogs", "dogCheck", "giveIron", 2, 200, "Get rid of 2 dogs!", 50)]);
world.id++;


world.npcs.push(King);
world.npcs.push(UndeadKing);
world.npcs.push(DwarfKing);
world.npcs.push(OrcKing);
world.npcs.push(Jay);

Faction = function(n, king)
{
     this.n = n;
     this.king = king;
}

world.factions = 
{
     "human": new Faction("Human", King),
     "undead": new Faction("Undead", UndeadKing),
     "Dwarf": new Faction("Dwarf", DwarfKing),
     "orc": new Faction("Orc", OrcKing),
     "neutral": new Faction ("Neutral", undefined)
};

fs.open("info/world.json", "w", undefined, function(err, fd)
     {
     if (err) throw err;
     fs.write(fd, JSON.stringify(world), undefined, undefined, function(err, written)
     {
          if (err) throw err;
          fs.close(fd, function(err)
          {
               if (err) throw err;
          });  
     });
});

users = new Array();

newUser("name", "password", "email");
newUser("name2", "password", "email");
newUser("name3", "password", "email");

fs.open("info/users.json", "w", undefined, function(err, fd)
     {
     fs.write(fd, JSON.stringify(users), undefined, undefined, function(err, written)
     {
          fs.close(fd, function(err){});
     });
});



/*{
     "stages": 
     [
          {"from": 100, "to":0, "img": [0, 0]},
     ],
     "rect": buffer.objects[i].pos.concat([40, 20]),
     "firstPos": buffer.objects[i].pos,
     "health": {"max": 100, "current": 100},
     "n": "Bla",
     "drop": [{"br": 0, "dropChance": 3}, {"br": 2, "dropChance": 1}, {"br": 3, "dropChance": 5}],
     "currentStage": 0,
     "img": [2, 0],
     "checkPos": [300, 300],
     "speed": {"val":1.5, "lastCheck": new Date().getTime()},
     "id": this.id,
     "type": "enemy",
     "bla": 5,
     "skills": {"attack": 20},
     "lastAttack": 0,
     "AIClock": new Date().getTime(),
     "inCombatWith": false,
}*/
/*subclasses = new Object();

subclasses.enemies = 
[
     {
     "n": "Dog",
     "health": {"current": 100, "max": 100},
     "rect": ["get", "get", 40, 20],
     "drop":
               [
                    {"br": 0, "dropChance": 3},
                    {"br": 2, "dropChance": 1},
                    {"br": 3, "dropChance": 5}
               ],

     "si": [[2, 0], [2, 1]],
     "img": [2, 0],        
     "id": "get",
     "skills": {"attack": 5},
     "level": 2,
     "speed": {"val": 1.5, "lastCheck": 0},
     "armRight": new Limb([3, 9], [11, 11], "rgb(60, 60, 0)"),
     "LegLeft": new Limb([3, 9], [11, 11], "rgb(60, 60, 0)"),
     "armRight": new Limb([3, 9], [37, 11], "rgb(60, 60, 0)"),
     "LegRight": new Limb([3, 9], [37, 11], "rgb(60, 60, 0)")
     },
];*/

