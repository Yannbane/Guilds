var fs = require('fs')

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
                    "rect": buffer.objects[i].concat([40, 20]),
                    "health": {"max": 100, "current": 100},
                    "n": "Bla",
                    "currentStage": 0,
                    "img": [2, 0],
                    "skills": {"attack": 20},
                    "speed": {"val":0.5, "lastCheck": new Date().getTime()},
                    "id": this.id,
                    "lastAttack": 0,
                    "type": "enemy",
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
     new Thing("tree", 100, 1) //1
];

var worldBuffer = new World(5000, things);
var world = new realWorld(worldBuffer);

fs.open("info/world.json", "w", undefined, function(err, fd){
     if (err) throw err;
     fs.write(fd, JSON.stringify(world), undefined, undefined, function(err, written){
          if (err) throw err;
          fs.close(fd, function(err){
               if (err) throw err;
          });  
     });
});

