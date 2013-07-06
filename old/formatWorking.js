fs = require("fs")

newUser = function(n, p, email)
{
     user = {n: n, p: p, email: email, pli:{property: new Array(), level: {level: 1, xpCurrent: 57, xpMax: 100}, units: new Array(), an: 0, wn: 0, target: false, skills: {attack: 5, woodCutting: 20, building: 20}, spells: [0, 1, 2, 3], health: {"max": 100, "current": 100}, options: [0], talents: {"points": 5, "speed": 0, "attack": 0, "effect": 0}, rect: [2500, 2500, 10, 46], resources: {wood: 11110, stone: 0, iron: 0}, speed: {"val":playerSpeed, "lastCheck": new Date().getTime()}}};
     world.id++;
     users.push(user);
     return true
}

spawn = [2400, 2400, 200, 200]

collision = function(rectOne, rectTwo)
{
     return (rectOne[0] + rectOne[2] > rectTwo[0] && rectOne[0] < rectTwo[0] + rectTwo[2] && rectOne[1] + rectOne[3] > rectTwo[1] && rectOne[1] < rectTwo[1] + rectTwo[3])
}

World = function(startSize, things)
{
     this.startSize = startSize;
     this.things = things;
     this.objects = [];

     for (t = 0; t < this.things.length; t++)
     {                    
          for (x = 0; x < this.startSize/this.things[t].appart; x++)
          {
               for (y = 0; y < this.startSize/this.things[t].appart; y++)
               {    
                    if (!(collision(spawn, [x * this.things[t].appart, y * this.things[t].appart, 10, 10])))
                    {
                         chance = Math.round(Math.random()*this.things[t].chance);
                         if (chance == 0)
                         {
                              chance = Math.round(Math.random());
                              offsetx = Math.round(Math.random()*10);
                              if (chance == 0)
                              {
                                   offsetx = offsetx * (-1);
                              }

                              chance = Math.round(Math.random());
                              offsety = Math.round(Math.random()*10);
                              if (chance == 0)
                              {
                                   offsety = offsety * (-1);
                              }

                              this.objects.push({"pos": [x * this.things[t].appart + offsetx, y * this.things[t].appart + offsety], "type": this.things[t].type});
                         }
                    }
                    else
                    {
                         console.log("NOT");
                    }
               }
          }
     }
}

realWorld = function(buffer)
{
     this.trees = new Array();
     this.structures = new Array();
     this.enemies = new Array();
     this.id = 0;     
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
                    "collision": false,
                    "id": this.id
               });
               this.id++;
          }

          if (buffer.objects[i].type == "enemy")
          {
               this.enemies.push(
               {
                    "stages": 
                    [
                         {"from": 100, "to":0, "img": [0, 0]},
                    ],
                    "rect": buffer.objects[i].pos.concat([40, 20]),
                    "health": {"max": 100, "current": 100},
                    "n": "Bla",
                    "currentStage": 0,
                    "img": [2, 0],
                    "speed": {"val":1.5, "lastCheck": new Date().getTime()},
                    "id": this.id,
                    "type": "enemy",
                    "skills": {"attack": 20},
                    "lastAttack": 0,
                    "inCombatWith": false
               });
               this.id++;
          }
     }
}

Thing = function(type, appart, chance)
{
     this.type = type;
     this.appart = appart;
     this.chance = chance;
}

var things = 
[
     new Thing("enemy", 200, 3), //0
     new Thing("tree", 141, 1) //1
];

var worldBuffer = new World(5000, things);
var world = new realWorld(worldBuffer);
var playerSpeed = 2;
world.units = new Array();

fs.open("info/world.json", "w", undefined, function(err, fd){
     if (err) throw err;
     fs.write(fd, JSON.stringify(world), undefined, undefined, function(err, written){
          if (err) throw err;
          fs.close(fd, function(err){
               if (err) throw err;
          });  
     });
});

users = new Array();

newUser("name", "password", "email");
newUser("name2", "password", "email");
newUser("name3", "password", "email");

fs.open("info/users.json", "w", undefined, function(err, fd){
     fs.write(fd, JSON.stringify(users), undefined, undefined, function(err, written){
          fs.close(fd, function(err){});
     });
});
