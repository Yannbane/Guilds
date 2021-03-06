var http = require("http");
var io = require("socket.io");
var fs = require("fs");
var sys = require("sys");

var spawnInterval = 10000;
var generalCooldown = 500;
var playerSpeed = 2;
var sx = 10000;
var sy = 10000;

handler = function(req, res)
{
     fs.readFile (__dirname + req.url, function(err, data){
          if (err)
          {
               res.writeHead(404);
               return res.end("file not found " + req.url);
          }
                    
          res.writeHead(200);
          res.end(data);
     });
}

auth = function(n, p, socket)
{                                                                     
     for (i = 0; i < users.length; i++)
          if (users[i].n == n && users[i].p == p)
          {                        
               player = 
               {                   
                    good: true,
                    pli: users[i].pli
               }                                  
               return player;               
          }                   
                                   
     return {good: false}
}                                                                

sliceHere = function(list, i)
{
     buffOne = list.slice(0, i);
     buffTwo = list.slice(i + 1);
     
     return buffOne.concat(buffTwo);         
}

var game_server = http.createServer(handler);
game_server.listen(8080);
var game_socket = io.listen(game_server);

game_socket.configure(function() 
{
  game_socket.set('log level', 1);
});

logout = function(n)
{
     for (i = 0; i < players.length; i++)
     {
          if (n == players[i].n)
          {         
               for (uss = 0; uss < users.length; uss++)
                    if (users[uss].n == players[i].n.n)
                    {
                         users[uss].pli.property = players[i].property;
                         users[uss].pli.quests = players[i].quests;
                    }

               for (stt = 0; stt < world.structures.length; stt++)
                    if (world.structures[stt].owner == players[i] && world.structures[stt].task != undefined && world.structures[stt].task != false)
                         clearInterval(world.structures[stt].task);
               
               for (uuu = 0; uuu < world.units.length; uuu++)
                    if (world.units[uuu].owner == players[i] && world.units[uuu].task != undefined && world.units[uuu].task != false)
                         clearInterval(world.units[uuu].task);

               for (ee = 0; ee < world.enemies.length; ee++)
                    if (world.enemies[ee].inCombatWith == players[i])
                         world.enemies[ee].inCombatWith = undefined;

               for (usss = 0; usss < users.length; usss++)
                    if (users[usss].n == players[i].n.n)
                         users[usss].pli = players[i].pack();

               for (g in world.guilds)
               {
                    for (m in world.guilds[g].members)
                         if (players[i] == world.guilds[g].members[m])
                         {
                              world.guilds[g].members[m] = players[i].id;
                              if (world.guilds[g].o == p)
                                   world.guilds[g].o = players[i].id
                         } 

                    for (a in world.guilds[g].app)
                         if (players[i] == world.guilds[g].app[a])
                              world.guilds[g].app[a] = players[i].id;
               }                                                              
               players = sliceHere(players, i);
          }
     }
}

/*newUser = function(n, p, email)
{
     user = {n: n, p: p, email: email, pli:{id: world.id, level: {level: 1, xpCurrent: 0, xpMax: 100}, units: new Array(), an: 0, wn: 0, target: false, skills: {attack: 5, woodCutting: 1, building: 1}, health: {"max": 100, "current": 100}, rect: [0, 0, 10, 46], resources: {wood: 10, stone: 0, iron: 0}, speed: {"val":playerSpeed, "lastCheck": new Date().getTime()}}};
     world.id++;
     users.push(user);
     return true
}*/

newUser = function(n, p, email, faction)
{
     user = {n: n, p: p, email: email, pli:{"faction": faction, achievements: new Array(), id: world.id, dogKill: 0, property: new Array(), quests: [], level: {level: 1, xpCurrent: 0, xpMax: 100}, units: new Array(), inventory: [2, 2, 6], an: undefined, wn: 0, target: false, skills: {attack: 1, woodCutting: 1, building: {"wood": 1, "stone": 1, "iron": 1}}, spells: [0, 1, 2, 3, 4, 5, 6, 8], spellBook: [0, 1, 2, 3, 4, 5, 6, 7], health: {"max": 100, "current": 100}, mana: {"max": 100, "current": 100}, options: [0, 1, 2, 3], talents: {"points": 1, "speed": 0, "attack": 0, "effect": 0}, rect: [2500, 2500, 10, 46], resources: {wood: 0, stone: 0, iron: 0, gold: 10}, speed: {"val":playerSpeed, "lastCheck": new Date().getTime()}}};
     world.id++;
     users.push(user);
     return true;
}

Enemy = function(args) //n, rect, img, id, health, speed, currentStage
{
     var e = this;

     e.sd = "dynamic"
     e.lastMove = [0, 0];
     e.checkPos = [300, 300];
     e.currentStage = 0;
     e.type = "enemy";
     e.lastAttack = 0;
     e.inCombatWith = false;
     e.follow = [0, 0];

     e.n = args.n;
     e.health = args.health;
     e.rect = args.rect;
          e.firstPos = [e.rect[0], e.rect[1]];
     e.drop = args.drop;
     e.si = args.si;
     e.img = args.img;        
     e.id = args.id;
     e.skills = args.skills;
     
     //if (e.skills == undefined)
     //     console.log(skills);

     e.level = args.level;
     e.speed = args.speed;
     e.limbs = args.limbs;
     e.limbsO = args.limbsO;

     for (l in e.limbs)
          e.limbs[l].rect = e.rect;

/*     e.armLeft = new Limb(e, [3, 9], [11, 11], "rgb(60, 60, 0)");
     e.LegLeft = new Limb(e, [3, 9], [11, 11], "rgb(60, 60, 0)");
     e.armRight = new Limb(e, [3, 9], [37, 11], "rgb(60, 60, 0)");
     e.LegRight = new Limb(e, [3, 9], [37, 11], "rgb(60, 60, 0)");*/

     e.pack = function()
     {
          e.giveLimbs = new Object();

          for (l in e.limbs)
               e.giveLimbs[l] = {"wh": e.limbs[l].wh, "style": e.limbs[l].style, "offset": e.limbs[l].offset};

          
          return {"limbsO": e.limbsO, "limbs": e.giveLimbs, "si": e.si, "n": e.n, "rect": e.rect, "img": e.img, "id": e.id, "health": e.health, "speed": e.speed, "currentStage": e.currentStage, "sills": e.skills};     

     }

     e.aiTime = Math.round(Math.random()*10000);
     e.follow = false;

     e.fire = function(dx, dy, p)
     {
          if (dx < 60 && dy < 60)
          {
                    e.inCombatWith = p;
                    e.speed.lastCheck = new Date().getTime();  
                    if (p.target == false || p.target == undefined)                  
                    p.target = e;
          }
     }

     e.ai = function()
     {
          e.AIchance = Math.round(Math.random()*2);

          if (e.AIchance == 0)
          {
               e.speed.lastCheck = new Date().getTime(); 
               e.chance = Math.round(Math.random()*4);
               e.speed.val = 0.5;
               if (e.chance == 0)
                    e.follow = [e.rect[0] + Math.random()*10000, e.rect[1] + Math.random()*10000];
               if (e.chance == 1)
                    e.follow = [e.rect[0] - Math.random()*10000, e.rect[1] + Math.random()*10000];
               if (e.chance == 2)
                    e.follow = [e.rect[0] + Math.random()*10000, e.rect[1] - Math.random()*10000];
               if (e.chance == 3)
                    e.follow = [e.rect[0] - Math.random()*10000, e.rect[1] - Math.random()*10000];

               setTimeout (function(){e.follow = false}, 10000*Math.random());
          }
     }
     
     e.aiCheck = setInterval(e.ai, e.aiTime);
     
     world.enemies.push(e);
}

load = function()
{
     for (s = 0; s < worldBuff.structures.length; s++)
          new Structure({"n": worldBuff.structures[s].n, "cost": worldBuff.structures[s].cost, "health": worldBuff.structures[s].health, "currentStage": worldBuff.structures[s].currentStage, "spawned": worldBuff.structures[s].spawned, "id": worldBuff.structures[s].id, "img": worldBuff.structures[s].img, "stages": worldBuff.structures[s].stages, "owner": worldBuff.structures[s].owner, "rect": worldBuff.structures[s].rect});
     
     for (u = 0; u < worldBuff.units.length; u++)
          world.units.push(new Unit({"skills": worldBuff.units[u].skills, "speed": worldBuff.units[u].speed, "n": worldBuff.units[u].n, "id": worldBuff.units[u].id, "img": worldBuff.units[u].img, "id": worldBuff.units[u].id, "health": worldBuff.units[u].health, "owner": worldBuff.units[u].owner, "rect": worldBuff.units[u].rect}));

     for (n = 0; n < worldBuff.npcs.length; n++)
          world.npcs.push(new Npc({"level": worldBuff.npcs[n].level, "faction": worldBuff.npcs[n].faction, "n": worldBuff.npcs[n].n, "health": worldBuff.npcs[n].health, "rect": worldBuff.npcs[n].rect, "id": worldBuff.npcs[n].id, "img": worldBuff.npcs[n].img, "quests": worldBuff.npcs[n].quests}));
     
     for (e = 0; e < worldBuff.enemies.length; e++)
          new Enemy({"limbsO": worldBuff.enemies[e].limbsO, "level": worldBuff.enemies[e].level, "si": worldBuff.enemies[e].si, "n": worldBuff.enemies[e].n, "drop": worldBuff.enemies[e].drop, "rect": worldBuff.enemies[e].rect, "img": worldBuff.enemies[e].img, "id": worldBuff.enemies[e].id, "health": worldBuff.enemies[e].health, "speed": worldBuff.enemies[e].speed, "skills": worldBuff.enemies[e].skills, "limbs": worldBuff.enemies[e].limbs });

     for (g = 0; g < worldBuff.guilds.length; g++)
          new Guild({"n": worldBuff.guilds[g].n, "members": worldBuff.guilds[g].members, "o": worldBuff.guilds[g].o}); 

     world.trees = worldBuff.trees;
     world.rocks = worldBuff.rocks;
     world.factions = worldBuff.factions;
}                                                                          

save = function()
{
     toSave = {"enemies": new Array(), "guilds": new Array(), "units": new Array(), "structures": new Array(), "npcs": new Array(), "trees": world.trees, "rocks": world.rocks, "id": world.id};
     
     for (s = 0; s < world.structures.length; s++)
          toSave.structures.push(world.structures[s].pack());
     
     for(e = 0; e < world.enemies.length; e++)
          toSave.enemies.push(world.enemies[e].pack());

     for(u = 0; u < world.units.length; u++)
          toSave.units.push(world.units[u].pack());
     
     for(n = 0; n < world.npcs.length; n++)
          toSave.npcs.push(world.npcs[n].pack());

     for (g = 0; g < world.guilds.length; g++)
          toSave.guilds.push(world.guilds[g].pack());

     for (pppp = 0; pppp < players.length; pppp++)
          for (uuuu = 0; uuuu < users.length; uuuu++)
               if (players[pppp].n.n == users[uuuu].n)
                    users[uuuu].pli = players[pppp].pack();

     fs.open("info/users.json", "w", undefined, function(err, fd)
     {
          fs.write(fd, JSON.stringify(users), undefined, undefined, function(err, written)
          {
               fs.close(fd, function(err)
               {
                    if (err)
                         throw err;
                         
                    fs.open("info/world.json", "w", undefined, function(err2, fd2)
                    {
                         fs.write(fd, JSON.stringify(toSave), undefined, undefined, function(err2, written2)
                         {
                              fs.close(fd2, function(err2)
                              {
                                   if (err2)
                                        throw err;
                              });
                         });
                    });
               });
          });
     });
}

target = function(rect)
{
     return [rect[0] - 5, rect[1] + rect[3] - rect[2]/2, self.pl.target.rect[2] + 10, self.pl.target.rect[2]];
}

whereFollowing = function(myPos, followPos, speed, time)
{
     move = new Array();
     
     if (followPos[0] - myPos[0] == 0)
          move[0] = 0;

     if (followPos[0] - myPos[0] < 0)
          move[0] = -1;

     if (followPos[0] - myPos[0] > 0)
          move[0] = 1;     

     if (followPos[1] - myPos[1] == 0)
          move[1] = 0;

     if (followPos[1] - myPos[1] < 0)
          move[1] = -1;

     if (followPos[1] - myPos[1] >  0)
          move[1] = 1;
     
     ret = [speed.val * move[0] * (time - speed.lastCheck)/25, speed.val * move[1] * (time - speed.lastCheck)/25];
     return ret
}

collision = function(rectOne, rectTwo)
{
     return (rectOne[0] + rectOne[2] > rectTwo[0] && rectOne[0] < rectTwo[0] + rectTwo[2] && rectOne[1] + rectOne[3] > rectTwo[1] && rectOne[1] < rectTwo[1] + rectTwo[3])
}

Guild = function(args)
{
     var g = this;
                                                                                                         
     g.n = args.n;
     g.o = args.o;
     g.members = args.members;
     g.app = args.app;     
     g.accepted = new Array();
     
     
     for (m in g.members)
          for (p in players)
               if (g.members[m] == players[p].id)
                    g.members[m] = players[p];
                         
     for (a in g.app)
          for (p in players)
               if (g.app[a] == players[p].id)
                    g.app[a] = players[p];
     
     g.pack = function()                     
     {
          g.giveMembers = new Array();
          g.giveApp = new Array();
          
          for (m in g.members)
               g.giveMembers.push(g.members[m].id);          

          for (a in g.app)
               if (g.app[a] instanceof Player)
                    g.giveApp.push(g.app[a].id);
               else
                    g.giveApp.push(g.app[a]);
               
          g.giveO = g.o.id;

          return{"n": g.n, "o": g.giveO, "members": g.giveMembers, "on": g.o.n.n, "app": g.giveApp};
     }
     
     g.memberJoin = function(mem)
     {
          g.members.push(mem);     
          mem.guild = g;     
     }
     
     world.guilds.push(g);
}

Unit = function(args) //n, img, id, health, owner, rect
{
     var u = this;

     u.sd = "dynamic";
     u.n = args.n;
     u.rect = args.rect;
     u.health = args.health;
     u.img = args.img;    
     u.owner = args.owner;    
     u.id = args.id;
     u.speed = args.speed;
     u.skills = args.skills;
     u.alive = true;
     u.level = {level: 1, xpCurrent: 0, xpMax: 100};
     u.follow = false;
     u.type = "unit";
     u.gLast = 0;
   
     u.a = {"armorVal": 10};  

     u.limbs = new Array();//[new Limb(p), new Limb(p), new Limb(p), new Limb(p)];
     
     
     u.limbs.armLeft = new Limb(u, [4, 13], [-2, 10], "rgb(150, 150, 0)");
     u.limbs.LegLeft = new Limb(u, [4, 21], [1, 26], "rgb(140, 140, 140)");
     u.limbs.armRight = new Limb(u, [4, 13], [8, 10], "rgb(150, 150, 0)");
     u.limbs.LegRight = new Limb(u, [4, 21], [5, 26], "rgb(140, 140, 140)");
       
     u.pack = function()
     {
          return {"health": u.health, "skills": u.skills, "speed": u.speed, "img": u.img, "n": u.n, "rect": u.rect, "id": u.id};
     } 
     
     u.build = function()
     {
          if (u.owner != undefined && u.owner != false)
          {
               if (u.owner.resources.wood >= u.skills.building && u.task.currentStage < u.task.stages.length)
               {
                    u.task.health.current += u.skills.building;
                    u.owner.resources.wood -= u.skills.building;
                    if (u.task.health.current > u.task.stages[u.task.currentStage].from)
                         if (u.task.stages[u.task.currentStage + 1] != undefined)
                         {
                              u.task.currentStage ++;
                              u.task.img = u.task.stages[u.task.currentStage].img;
                              game_socket.sockets.emit("changeStatic", {"img": u.task.img, "id": u.task.id, "rect": u.task.rect, "health": u.task.health});
                         }
                    if (u.task.health.current > u.task.health["max"])
                         u.task.health["max"] = u.task.health.current;
               }
          }
     }
     
     u.attack = function()
     {
          u.task.inCombatWith = u;
          u.task.speed.lastCheck = new Date().getTime();
          u.task.health.current -= u.skills.attack;
     }

     u.gather = function()
     {
          if (u.owner != undefined || u.owner != false)
          {
               if (new Date().getTime() - u.gLast > generalCooldown)
               {
                    u.gLast = date.getTime();
                    
                    if (u.task.stages[u.task.currentStage].to == 0)
                         if (u.task.type == "tree")
                         {
                              u.owner.resources.wood += u.skills.woodCutting;
                              u.owner.attackDamage.push([u.skills.woodCutting, u.task.rect, "(230, 50, 50, ", 1, 2000]);
                         }
                         else if (u.task.type == "rock")
                         {
                              u.owner.resources.stone += u.skills.woodCutting;
                              u.owner.attackDamage.push([u.skills.woodCutting, u.task.rect, "(200, 200, 200, ", 1, 2000]);
                         }
                         
                    if (u.task.health.current <= 0)
                         clearInterval(u.todo);
                                                                                
                    u.task.health.current -= u.skills.woodCutting;

                    if (u.task.health.current < u.task.stages[u.task.currentStage].to)
                         if (u.task.stages[u.task.currentStage + 1] != undefined)
                         {
                              u.task.currentStage ++;
                              u.task.img = u.task.stages[u.task.currentStage].img;
                              game_socket.sockets.emit("changeStatic", {"img": u.task.img, "id": u.task.id, "rect": u.task.rect, "health": u.task.health});
                         }
               }
          }
     }
}

Building = function(img, stages, rect, cost, health, spawner, tag, n) //building info
{
     this.img = img;
     this.rect = rect;
     this.stages = stages;
     this.cost = cost;
     this.health = health;
     this.spawner = spawner;
     this.tag = tag;
     this.n = n;
     
     buildings.push(this);
}

Structure = function(args)//img, stages, owner, rect
{
     var s = this;
     
     s.sd = "static";
     s.type = "structure";
     s.rect = args.rect;
     s.img = args.img;
     s.cost = args.cost;
     s.stages = args.stages;
     s.currentStage = args.currentStage;
     s.id = args.id;
     s.owner = args.owner;
     s.health = args.health;
     s.spawned = args.spawned;
     s.n = args.n;
     s.spawner = args.spawner;
     
     s.pack = function()
     {
          if (s.owner instanceof Player)
               s.owner = undefined;

          return {"n": s.n, "health": s.health, "rect": s.rect, "cost": s.cost, "id": s.id, "spawned": s.spawned, "stages": s.stages, "img": s.img, "currentStage": s.currentStage}
     }
     
     s.spawnUnit = function()
     {//Unit = function(n, img, id, health, owner, rect)
          world.units.push(new Unit({"skills": {"attack": 1, "building": 1, "woodCutting": 1}, "health": {"current": 100, "max": 100}, "speed": {"val": 1.5, "lastCheck": new Date().getTime()}, "n": "Unit", "img": [3, 0], "id": world.id, "stages": {"current": 100, "max": 100}, "owner": s.owner, "rect": [s.rect[0] + Math.round(Math.random()*(s.rect[2] / s.owner.rect[2]))*s.owner.rect[2], s.rect[1] + s.rect[3] - s.owner.rect[3] + s.owner.rect[2] + 1, s.owner.rect[2], s.owner.rect[3]]}));
          world.id ++;
          s.spawned ++;    
          if (s.spawned >= s.stages[s.currentStage].maxUnits)
               clearInterval(s.task);
     }
     

     world.structures.push(s);
     game_socket.sockets.emit("newStatic", {"img":s.img, "id": s.id, "rect": s.rect, "health": s.health});
}

Npc = function(args) //n, health, rect, id, img, quests
{
     var npc = this

     npc.n = args.n;
     npc.health = args.health;
     npc.rect = args.rect;
     npc.id = args.id;
     npc.img = args.img;
     npc.level = args.level;
     npc.faction = args.faction;
     npc.quests = args.quests;

     npc.type = "npc";
     npc.sd = "dynamic";     

     if(npc.n != "Dwarf king" && npc.n != "High priest")     
     {
          npc.limbs = new Object();
                                                                                               
          npc.limbs.armLeft = new Limb(npc, [4, 13], [-2, 10], "rgb(150, 150, 0)");
          npc.limbs.LegLeft = new Limb(npc, [4, 21], [1, 26], "rgb(140, 140, 140)");
          npc.limbs.armRight = new Limb(npc, [4, 13], [8, 10], "rgb(150, 150, 0)");
          npc.limbs.LegRight = new Limb(npc, [4, 21], [5, 26], "rgb(140, 140, 140)");
     }
                                                                                                              
     npc.pack = function()
     {
          return {"faction": npc.faction, "n": npc.n, "health": npc.health, "rect": npc.rect, "id": npc.id, "img": npc.img, "quests": npc.quests};
     }
}

woodCheck = function(player, quest)
{
     if (player.resources.wood >= quest.needed)
     {
          player.resources.wood -= quest.needed;
          return true;
     }
     else
     {
          return false;
     }
}

dogCheck = function(player, quest)
{
     if (player.dogKill >= quest.needed)
     {
          player.dogKill = 0;
          return true;
     }
     else
     {
          return false;
     }
}

checks = 
[
     {"n": "woodCheck", "check": woodCheck},
     {"n": "dogCheck", "check": dogCheck}
];


giveIron = function(player, quest)
{
     player.resources.iron += quest.give;
}

complete = 
[
     {"n": "giveIron", "complete": giveIron}
];


completeA = function(p, a)
{
     p.achievements.push(a);
     p.attackDamage.push(["Achievement '" + a.n + "' complete!", p.rect, "(250, 250, 10, ", 1, 10000]);          
}

buildCheck = function(p)
{
     for (s in world.structures)
          if (world.structures[s].owner == p && world.structures[s].n == "house")
               return true;
     
     return false;
}

Achievement = function(n, check, whenComplete, reward)
{
     var a = this;

     a.n = n;
     a.check = check;
     a.whenComplete = whenComplete;
     a.reward = reward;

     achievements.push(a);
}

achievements = new Array();

new Achievement("Build a house", buildCheck, completeA, [100, 10, 10, 1]);

Item = function(type, n, wh, img, d, args, onClick)
{
     var i = this;

     i.type = type;
     i.n = n;
     i.wh = wh;
     i.d = d;
     i.onClick = onClick;
     
     if (i.type == "weapon")
     {
          i.damage = args.damage;
          i.imgs = img;
          i.img = i.imgs.right;
          i.offset = args.offset;
     }
     else if (i.type == "armor")
     {
          i.armorVal = args.armorVal; 
          i.imgs = img;
          i.img = i.imgs.ud;
     }     
     else if (i.type == "healthPotion")
     {
          i.healthVal = args.healthVal;
          i.img = img;
     }
     else if (i.type == "manaPotion")
     {
          i.manaVal = args.manaVal;
          i.img = img;
     }
     else if (i.type == "shirt")
     {
          i.color = args.color;
          i.img = img;
     }
     else
     {
          i.img = img;
     }     

     items.push(i);
}

kick = function(player)
{
     if (player.mana.current - 20 > 0)
     {
          if (player.target == undefined || player.target == false)
          {
               for (enn = 0; enn < world.enemies.length; enn++)
               {
                    if (collision(player.rect, world.enemies[enn].rect))
                    {
                         player.target = world.enemies[enn];
                         world.enemies[enn].inCombatWith = player;
                         world.enemies[enn].speed.lastCheck = date.getTime();
                    }
               }
          }
          
          var enemy = player.target;

          if (enemy != undefined && enemy != false)
          {
               if (collision(player.rect, enemy.rect) || collision(player.w.rect, enemy.rect))
               {
                    enemy.out = Math.round(Math.random()*5)*(1 + player.talents.effect/(player.talents.effect +1));

                    player.effect = setInterval(function()
                    {
                         if(player.rect[0] + player.rect[2]/2 - 2 > enemy.rect[0])
                              enemy.rect[0] -= 12 * (1 + player.talents.effect/(player.talents.effect +1));
                         else
                              enemy.rect[0] += 12 * (1 + player.talents.effect/(player.talents.effect +1));

                         if (player.rect[1] + player.rect[3]/2 > enemy.rect[1])
                              enemy.rect[1] -= enemy.out;
                         else
                              enemy.rect[1] += enemy.out;

                    }, 15);
                    
                    player.cancel = setTimeout(function(){clearInterval(player.effect)}, 100);
                    enemy.health.current -= player.skills.attack*0.4*(1 + player.talents.attack/(player.talents.attack+1));
                    player.attackDamage.push([player.skills.attack*0.4*(1 + player.talents.attack/(player.talents.attack+1)), enemy.rect, "(250, 250, 250, ", 1, 2000]);          
                    player.mana.current -= 20;
               }
          }
     }
}


basicAttack = function(player)
{
     if (player.mana.current - 12 > 0)
          for (en = 0; en < world.enemies.length; en++)
          {
               if (collision(player.w.rect, world.enemies[en].rect))
               {
                    player.target = world.enemies[en];
                    world.enemies[en].inCombatWith = player;
                    world.enemies[en].speed.lastCheck = date.getTime();
                    
                    if (Math.round(Math.random()) == 0)
                    {
                         crit = false;
                         damage = ((player.skills.attack * (1 + Math.sqrt(player.talents.attack)/10)) + player.w.damage)*0.8 + ((player.skills.attack * (1 + Math.sqrt(player.talents.attack)/10)) + player.w.damage)*0.2*Math.random();
                    }
                    else
                    {
                         crit = true;
                         damage = (((player.skills.attack * (1 + Math.sqrt(player.talents.attack)/10)) + player.w.damage)*0.8 + ((player.skills.attack * (1 + Math.sqrt(player.talents.attack)/10)) + player.w.damage)*0.2*Math.random())*3;
                    }

                    world.enemies[en].health.current -= damage;
                    
                    if (crit)
                    {
                         player.attackDamage.push([damage, world.enemies[en].rect, "(250, 20, 20, ", 1, 5000]);
                         player.attackDamage.push(["Crit!", [world.enemies[en].rect[0], world.enemies[en].rect[1] - 20, world.enemies[en].rect[2], world.enemies[en].rect[3]], "(240, 240, 240, ", 1, 2000]);
                    }
                    else
                         player.attackDamage.push([damage, world.enemies[en].rect, "(240, 240, 240, ", 1, 2000]);
                                        
                    player.mana.current -= 12;
                    break;
               }
          }
}

chopWood = function(p)
{
     var no = false;
     
     for (t = 0; t < world.rocks.length; t++)
     {
          if (collision(p.rect, world.rocks[t].rect))
          {
               var no = true
               p.target = world.rocks[t];
               if (world.rocks[t].stages[world.rocks[t].currentStage].to == 0)
                    p.resources.stone += p.skills.woodCutting;
                         

               if (Math.round(Math.random()*2) == 0)
               {
                    var get = Math.round(Math.random()*5);
                    p.resources.iron += get;
               }        
               else
                    var get = 0;                                                    
               
               world.rocks[t].health.current -= p.skills.woodCutting;

               if (world.rocks[t].health.current < world.rocks[t].stages[world.rocks[t].currentStage].to)
                    if (world.rocks[t].stages[world.rocks[t].currentStage + 1] != undefined)
                    {
                         world.rocks[t].currentStage ++;
                         world.rocks[t].img = world.rocks[t].stages[world.rocks[t].currentStage].img;
                         game_socket.sockets.emit("changeStatic", {"img": world.rocks[t].img, "id": world.rocks[t].id, "rect": world.rocks[t].rect, "health": world.rocks[t].health});
                    }
         
               if (get > 0)
                    p.attackDamage.push([get + " (iron)", [world.rocks[t].rect[0], world.rocks[t].rect[1] - 50, world.rocks[t].rect[2], world.rocks[t].rect[3]], "(60, 60, 60, ", 1, 2000]);
               
               p.attackDamage.push([p.skills.woodCutting, world.rocks[t].rect, "(200, 200, 200, ", 1, 2000]);

               if (world.rocks[t].health.current <= 0)
               {
                    p.skills.woodCutting += 0.1; //masonry
                    p.target = false;
                    world.rocks = sliceHere(world.rocks, t);
               }

               break;
          }
     }

     if (!(no))     
     for (t = 0; t < world.trees.length; t++)
     {
          if (collision(p.rect, world.trees[t].rect))
          {
               p.target = world.trees[t];
               if (world.trees[t].stages[world.trees[t].currentStage].to == 0)
                    p.resources.wood += p.skills.woodCutting;
                         
                                                                           
               world.trees[t].health.current -= p.skills.woodCutting;

               if (world.trees[t].health.current < world.trees[t].stages[world.trees[t].currentStage].to)
               {
                    world.trees[t].currentStage ++;
                    if (world.trees[t].stages[world.trees[t].currentStage] != undefined)
                    world.trees[t].img = world.trees[t].stages[world.trees[t].currentStage].img;
                    game_socket.sockets.emit("changeStatic", {"img": world.trees[t].img, "id": world.trees[t].id, "rect": world.trees[t].rect, "health": world.trees[t].health});
               }
         
               p.attackDamage.push([p.skills.woodCutting, world.trees[t].rect, "(20, 150, 20, ", 1, 2000]);

               if (world.trees[t].health.current <= 0)
               {
                    p.skills.woodCutting += 0.1;
                    p.target = false;
               }
               
               break;
          }
     }
}

repair = function(p)
{
     for (s = 0; s < world.structures.length; s++)
          if (world.structures[s].owner == p)
          {          
               if (world.structures[s].stages != undefined)               
               if(world.structures[s].health.current > world.structures[s].stages[world.structures[s].currentStage].to && world.structures[s].currentStage < world.structures[s].stages.length)
               {
                    world.structures[s].currentStage++;
                    world.structures[s].img = world.structures[s].stages[world.structures[s].currentStage].img;
                    if (world.structures[s].spawner)
                         world.structures[s].task = setInterval(world.structures[s].spawnUnit, world.structures[s].stages[world.structures[s].currentStage].interval);
               }

               if (collision(p.rect, world.structures[s].rect))
               {
                    p.target = world.structures[s];
                    
                    yes = true;
                    
                    if (world.structures[s].cost[0] > 0)                    
                    {
                         if (p.resources.wood >= p.skills.building.wood)
                              yes = true;
                         else
                              yes = false;
                    }
                    if (world.structures[s].cost[1] > 0)                    
                    {
                         if (p.resources.stone >= p.skills.building.stone)
                              yes = true;
                         else
                              yes = false;
                    }
                    if (world.structures[s].cost[2] > 0)                    
                    {
                         if (p.resources.iron >= p.skills.building.iron)
                              yes = true;
                         else
                              yes = false;
                    }
                    
                    if (yes)
                    {
                         if (world.structures[s].cost[0] > 0)                    
                         {
                              p.resources.wood -= p.skills.building.wood;
                              world.structures[s].health.current += p.skills.building.wood;
                              p.attackDamage.push([p.skills.building.wood, [world.structures[s].rect[0] + Math.random()*50, world.structures[s].rect[1] + Math.random()*50, world.structures[s].rect[2], world.structures[s].rect[3]], "(50, 50, 0, ", 1, 1000]);
                         }
                         if (world.structures[s].cost[1] > 0)                    
                         {
                              p.resources.stone -= p.skills.building.stone;
                              world.structures[s].health.current += p.skills.building.stone;
                              p.attackDamage.push([p.skills.building.stone, [world.structures[s].rect[0] + Math.random()*50, world.structures[s].rect[1] + Math.random()*50, world.structures[s].rect[2], world.structures[s].rect[3]], "(200, 200, 200, ", 1, 1000]);
                         }
                         if (world.structures[s].cost[2] > 0)                    
                         {
                              p.resources.iron -= p.skills.building.iron;
                              world.structures[s].health.current += p.skills.building.iron;
                              p.attackDamage.push([p.skills.building.iron, [world.structures[s].rect[0] + Math.random()*50, world.structures[s].rect[1] + Math.random()*50, world.structures[s].rect[2], world.structures[s].rect[3]], "(100, 100, 100, ", 1, 1000]);
                         }
                    }
                    else if (world.structures[s].health.current < world.structures[s].health["max"])
                    {
                         if (world.structures[s].cost[0] > 0)                    
                         {
                              world.structures[s].health.current += p.resources.wood;
                              p.skills.building.wood += 0.1;
                              p.resources.wood = 0;

                              p.attackDamage.push(["Building with wood skill increased by 0.1!", [p.rect[0], p.rect[1] - 100, p.rect[2], p.rect[3]], "(200, 200, 50, ", 1, 4000]);
                         }
                         if (world.structures[s].cost[1] > 0)                    
                         {
                              world.structures[s].health.current += p.resources.stone;
                              p.skills.building.stone += 0.1;
                              p.resources.stone = 0;

                              p.attackDamage.push(["Building with stone skill increased by 0.1!", [p.rect[0], p.rect[1] - 100, p.rect[2], p.rect[3]], "(200, 200, 200, ", 1, 4000]);
                         }
                         if (world.structures[s].cost[2] > 0)                    
                         {
                              world.structures[s].health.current += p.resources.iron;
                              p.skills.building.iron += 0.1;
                              p.resources.iron = 0;

                              p.attackDamage.push(["Building with iron skill increased by 0.1!", [p.rect[0], p.rect[1] - 100, p.rect[2], p.rect[3]], "(60, 60, 60, ", 1, 4000]);
                         }
                    }
               }
               if (world.structures[s].health.current > world.structures[s].health["max"])
                    world.structures[s].health["max"] = world.structures[s].health.current;

               game_socket.sockets.emit("changeStatic", {"img": world.structures[s].img, "id": world.structures[s].id, "rect": world.structures[s].rect, "health": world.structures[s].health});
               p.sound = "hammer";
          }
}

build = function(p, w)
{
     if (p.resources.wood >= buildings[w].cost[0] && p.resources.stone >= buildings[w].cost[1] && p.resources.iron >= buildings[w].cost[2] && p.resources.gold >= buildings[w].cost[3])
     {
          var yes = true;
          var g = true;
                    
          if (buildings[w].tag == "guild")
               if (p.guild != undefined)
               {
                    if (p.guild.o == p && p.guild.home == undefined)
                         yes = true;
                    else
                    {
                         yes = false;
                         p.attackDamage.push(["You aren't the Guild Master or your guild already has a home.", p.rect, "(250, 10, 10, ", 1, 2000]);
                    }
               }
               else
               {
                    yes = false;
                    p.attackDamage.push(["You must be in a guild to build guild structures.", p.rect, "(250, 10, 10, ", 1, 2000]);
               }
          else
               g = false;

          if (yes)
          {
               var rect = p.rect.slice();
               rect[0] += p.rect[2] + 5;
               rect[1] -= buildings[w].rect[3] - p.rect[3];
               
               rect[2] = buildings[w].rect[2];                                  
               rect[3] = buildings[w].rect[3];

               p.resources.wood -= buildings[w].cost[0];
               p.resources.stone -= buildings[w].cost[1];
               p.resources.iron -= buildings[w].cost[2];
               p.resources.gold -= buildings[w].cost[3];

               if (g)
               {
                    p.guild.home = new Structure({"n": buildings[w].n, "id": world.id, "spawned": 0, "currentStage": 0, "cost": buildings[w].cost, "health": {"current": buildings[w].health.current, "max": buildings[w].health["max"]}, "img": buildings[w].img, "stages": buildings[w].stages.slice(), "owner": p, "rect": rect, "spawner": buildings[w].spawner});

                    for (m in p.guild.members)
                         p.guild.members[m].spellBook.push(9);
               }
               else if (buildings[w].n == "house")
                    p.house = new Structure({"n": buildings[w].n, "id": world.id, "spawned": 0, "currentStage": 0, "cost": buildings[w].cost, "health": {"current": buildings[w].health.current, "max": buildings[w].health["max"]}, "img": buildings[w].img, "stages": buildings[w].stages, "owner": p, "rect": rect, "spawner": buildings[w].spawner});
               
               world.id++;
               p.target = world.structures[world.structures.length - 1];
               p.sound = "build";
          }
     }
     else
          p.attackDamage.push(["Not enough resources!", p.rect, "(250, 10, 10, ", 1, 2000]);
s}

/*Chest = function()
{

}*/

arrows = [];

Arrow = function(x, y, followX, followY, health, owner)
{
     var ar = this;
     
     ar.sd = "dynamic";
     ar.rect = [x, y, 28, 3];
     ar.img = [4, 2];
     ar.owner = owner;
     ar.id = world.id;
     world.id++;
     ar.range = health + 1;
     ar.ranges = [0, 0.6/(1 + (ar.range/ar.range+1)), 0.99/(1 + (ar.range/ar.range+1))];
     
     ar.chance = Math.random();
     
     if (ar.chance > ar.ranges[1] && ar.ranges[2] < 0.99)
          ar.health = 100 * Math.random() * 0.5;
     else if (ar.chance >= ar.ranges[2])
          ar.health = 100 * Math.random() * 2;
     else if (ar.chance < ar.ranges[1])
          ar.health = 100 * Math.random() * 0.2;
    
     ar.chance = Math.round();
     
     if(ar.chance < ar.ranges[1])
     {
          ar.health = 0;
     }

     
     ar.tag = "arrow";
     
     ar.x = x;
     ar.y = y;
     
     ar.followX = followX;
     ar.followY = followY;
     
     ar.path = Math.sqrt(Math.pow(ar.followX - ar.x, 2) + Math.pow(ar.followY - ar.y, 2));
     ar.where = [(ar.followX - ar.x)/ar.path*4, (ar.followY - ar.y)/ar.path*4];

     ar.fall = function()
     {
          for(a = 0; a < arrows.length; a++)
               if (arrows[a] == ar)
               {
                    clearInterval(ar.flying);
                    arrows = sliceHere(arrows, a);
               }
     }
     
     ar.flying = setInterval(function()
     {
          ar.rect[0] += ar.where[0]/0.4;
          ar.rect[1] += ar.where[1]/0.4;
          ar.health = ar.health*0.9999;
     }, 50);
     
     ar.whenFall = setTimeout(ar.fall, ar.owner.talents.attack*200 + 1000);
}

fireArrow = function(player)
{
     for (bb = 0; bb < player.inventory.length; bb++)
          if (player.inventory[bb] == 4)
          {
               arrows.push(new Arrow(player.rect[0] + player.rect[2] - 1, player.rect[1] + player.rect[3]/2 - 10, player.rect[0] + player.mouse.x - player.sx/2, player.rect[1] + player.mouse.y - player.sy/2, player.talents.attack, player));
               player.inventory = sliceHere(player.inventory, bb); 
               break;
          }
}

makeWoodenArrow = function(p)
{
     if (p.resources.wood - 3 > 0)
     {
          p.resources.wood -= 3;
          p.inventory.push(4);
     }
}

buildHouse = function(p)
{
     build(p, 0);
}

buildWoodenWall = function(p)
{
     build(p, 1);
}

buildGuildHouse = function(p)
{
     build(p, 2);
}

teleport = function(p)
{
     r = 100
     p.rect[0] = p.guild.home.rect[0] + p.guild.home.rect[2]/2 + p.rect[2]/2 - r/2 + r*Math.random();
     p.rect[1] = p.guild.home.rect[1] + p.guild.home.rect[3] + r*Math.random();
}

spells = [basicAttack, kick, chopWood, repair, fireArrow, buildHouse, buildWoodenWall, makeWoodenArrow, buildGuildHouse, teleport];

pack = function()
{
     ret = [];
     for (t = 0; t < objects.length; t++)
          if (objects[t].sd == "static")
               ret.push({"img": objects[t].img, "rect": objects[t].rect, "health": objects[t].health, "id": objects[t].id});

     return ret;
}

seeingStatic = function(p)
{
     ret = [];
     for (t = 0; t < p.to.length; t++)
          if (p.to[t].sd == "static")
          {
               dx = p.rect[0] - p.to[t].rect[0];
               dy = p.rect[1] - p.to[t].rect[1];
               
               if (dx < 0)
                    dx = dx * (-1);

               if (dy < 0)
                    dy = dy * (-1);
               
               if (dx < (p.sx/2 + 300) && dy < (p.sy/2 + 300) && p.to[t].n != p.n)
               {
                    if (p.to[t].colWP)
	                    ret.push({"collision": true, "img": p.to[t].img, "rect": p.to[t].rect, "health": p.to[t].health, "id": p.to[t].id});
                    else
                         ret.push({"img": p.to[t].img, "rect": p.to[t].rect, "health": p.to[t].health, "id": p.to[t].id});
               }
          }
     return ret;
}

seeingDynamic = function(p)
{
     ret = [];
     for (t = 0; t < p.to.length; t++)
     {
          if (p.to[t].sd == "dynamic" && p.to[t] != p)
          {
               dx = p.rect[0] - p.to[t].rect[0];
               dy = p.rect[1] - p.to[t].rect[1];
               
               if (dx < 0)
                    dx = dx * (-1);

               if (dy < 0)
                    dy = dy * (-1);
               
               if (dx < (p.sx/2 + 300) && dy < (p.sy/2 + 300) && p.to[t].n != p.n)
               {
                    if (!(p.to[t] instanceof liveItem))
                    {
                         if (p.to[t].type == "enemy")
                              p.to[t].fire(dx, dy, p);               

                         limbs = new Array();
          
                         for (x in p.to[t].limbs)                    
                              limbs.push({"rect": [p.to[t].limbs[x].rect[0] + p.to[t].limbs[x].offset[0], p.to[t].limbs[x].rect[1] + p.to[t].limbs[x].offset[1], p.to[t].limbs[x].wh[0], p.to[t].limbs[x].wh[1]], "style":p.to[t].limbs[x].style});
                         
                         ret.push({"img": p.to[t].img, "rect": p.to[t].rect, "health": p.to[t].health, "id": p.to[t].id, "limbs": limbs/*p.to[t].limbs*/});         

                         if (p.to[t].type == "npc")
                              if (p.to[t].quests != undefined && (p.to[t].faction == p.faction || p.to[t].faction == "neutral"))
                              {
                                   yes = true;
                                   for (qo = 0; qo < p.to[t].quests.length; qo++)
                                        for(qs = 0; qs < p.quests.length; qs++)
                                             if (p.quests[qs].n == p.to[t].quests[qo].n)
                                                  yes = false;
                                   
                                   if (yes)
                                        ret[ret.length - 1]["quest"] = true;
                              }
                         
                         if (p.to[t].type == "player")
                         {
                              ret[ret.length - 1]["w"] = p.to[t].w;
                              ret[ret.length - 1]["a"] = p.to[t].a;
                         }
                    }
                    else
                    {
                         ret.push(p.to[t]);
                    }
               }
          }
     }

     return ret;
}

seeing = function(p)
{
     ret = [];
     for (t = 0; t < objects.length; t++)
     {
          dx = p.rect[0] - objects[t].rect[0];
          dy = p.rect[1] - objects[t].rect[1];
          
          if (dx < 0)
               dx = dx * (-1);

          if (dy < 0)
               dy = dy * (-1);
          
          if (dx < (p.sx/2 + 300) && dy < (p.sy/2 + 300) && objects[t].n != p.n)
               ret.push(objects[t]);

     }
     return ret;
}


/*seeing = function(p)
{
     ret = [];
     for (t = 0; t < objects.length; t++)
     {
          dx = p.rect[0] - objects[t].rect[0];
          dy = p.rect[1] - objects[t].rect[1];
          
          if (dx < 0)
               dx = dx * (-1);

          if (dy < 0)
               dy = dy * (-1);
          
          if (dx < (p.sx/2 + 300) && dy < (p.sy/2 + 300) && objects[t].n != p.n)
          {
               if (objects[t].type == "enemy")
                    objects[t].fire(dx, dy, p);               
               
               if (objects[t].colWP)
                    ret.push({"collision": true, "img": objects[t].img, "rect": objects[t].rect, "health": objects[t].health, "id": objects[t].id});
               else
                    ret.push({"img": objects[t].img, "rect": objects[t].rect, "health": objects[t].health, "id": objects[t].id});

               if (objects[t].type == "npc")
                    if (objects[t].quests != undefined)
                    {
                         yes = true;
                         for (qo = 0; qo < objects[t].quests.length; qo++)
                              for(qs = 0; qs < p.quests.length; qs++)
                                   if (p.quests[qs].n == objects[t].quests[qo].n)
                                        yes = false;
                         
                         if (yes)
                              ret[ret.length - 1]["quest"] = true;
                    }
          }
     }
     return ret;
}*/

Limb = function(objekt, wh, offset, style)
{
     var l = this;
     
     l.objekt = objekt;
     l.offset = offset;
     l.wh = wh;
     l.style = style;
     
     l.rect = l.objekt.rect;
}

Player = function(n, socket, pli) //dogKill, property, quests, level, units, an, wn, target, skills, spells, health, options, talents, rect, resources, speed
{
     var p = this;
     
     p.sd = "dynamic";

     p.side = "right";     
     p.pack = function()
     {
          p.retProperty = new Array();
          
          for (ss = 0; ss < world.structures.length; ss++)
          {
               if (world.structures[ss].owner == p)
               {
                    p.retProperty.push(world.structures[ss].id);
               }
          }

          for (uu = 0; uu < world.units.length; uu++)
          {
               if (world.units[uu].owner == p)
               {
                    p.retProperty.push(world.units[uu].id);
               }
          }

          p.tellSpells = new Array();

          for (sp = 0; sp < p.spells.length; sp++)
               for (ssp = 0; ssp < spells.length; ssp++)
                    if (p.spells[sp] == spells[ssp])
                         p.tellSpells[sp] = ssp;
               
          return {"faction": p.faction, "achievements": p.achievements, "options": p.options, "wn": p.wn, "an": p.an, "spellBook": p.spellBook.slice(), "mana": p.mana, "n": p.n, "level": p.level, "health": p.health, "talents": p.talents, "rect": p.rect, "dogKill": p.dogKill, "speed": p.speed, "resources": p.resources, "spells": p.tellSpells, "skills": p.skills, "quests": p.quests, "inventory": p.inventory, "property": p.retProperty, "id": p.id};     
     }

     p.n = n;
     p.mana = pli.mana;
     p.socket = socket;
     p.level = pli.level;
     p.health = pli.health;
     p.talents = pli.talents;
     p.target = pli.target;
     p.rect = pli.rect;
     p.attackDamage =  new Array();
     p.faction = pli.faction;
     
     p.input = {
          two: false,
          one: false,
          four: false,
          five: false,
          six: false,
          seven: false,
          eight: false,

          threeLast: 0,
          fourLast: 0,
          fiveLast: 0,
          oneLast: 0,
          twoLast: 0,
          sixLast: 0,
          sevenLast: 0,
          eightLast: 0
     };

     p.dogKill = pli.dogKill;
     p.type = "player";
     p.mouse = {"x": 0, "y": 0};
     p.options = pli.options;
     p.arrow = 
     {
          "img": [6, 0],
          "rect": [0, 0, 13, 15]
     };
     
     p.speed = pli.speed;
     p.stages = [{"wh": [10, 46]}]; //FIX
     p.currentStage = 0;
     p.resources = pli.resources;
     p.spells = pli.spells;
     p.skills = pli.skills;
     p.achievements = pli.achievements;
     p.quests = pli.quests;
     p.property = pli.property;
     
     p.img = [3, 0];
     
     p.sx = 0;
     p.sy = 0;
     
     p.inventory = pli.inventory;
     p.alive = true;
     
     p.limbs = new Object();//[new Limb(p), new Limb(p), new Limb(p), new Limb(p)];
     
     p.limbs.armLeft = new Limb(p, [4, 13], [-2, 10], "rgb(150, 150, 0)");
     p.limbs.LegLeft = new Limb(p, [4, 21], [1, 26], "rgb(140, 140, 140)");
     p.limbs.armRight = new Limb(p, [4, 13], [8, 10], "rgb(150, 150, 0)");
     p.limbs.LegRight = new Limb(p, [4, 21], [5, 26], "rgb(140, 140, 140)");

     p.changeC = function(n)
     {
          p.limbs.armLeft.style = items[n].color;
          p.limbs.LegLeft.style = items[n].color;
          p.limbs.armRight.style = items[n].color;
          p.limbs.LegRight.style = items[n].color;
     }

     p.equipWeapon = function(n)
     {
          p.wn = n;
          p.w = {"offset": items[p.wn].offset, "damage": items[p.wn].damage, "img": items[p.wn].img, "n": items[p.wn].n, "rect": [0, 0].concat(items[p.wn].wh.slice(0))};
     }

     p.equipArmor = function(n)
     {     
          p.an = n;
          p.a = {"armorVal": items[p.an].armorVal, "img": items[p.an].img, "n": items[p.an].n, "rect": [0, 0].concat(items[p.an].wh.slice(0))};
     }
     
     p.revive = function()
     {
          p.alive = true;
          p.health.current = p.health["max"]/2;
          p.sentDA = false;

          p.rect[0] = world.spawnPoint[0];
          p.rect[1] = world.spawnPoint[1];

          if (p.house != undefined)
          {
               p.rect[0] = p.house.rect[0] + p.house.rect[2]/2;
               p.rect[1] = p.house.rect[1] + p.house.rect[3] - p.rect[3]/2 + 5;
          }

          if (p.guild != undefined)          
               if (p.guild.house != undefined)
               {
                    p.rect[0] = p.guild.house.rect[0] + p.guild.house.rect[2]/2;
                    p.rect[1] = p.guild.house.rect[1] + p.guild.house.rect[3] - p.rect[3]/2 + 5;
               }
     } 
         
     p.die = function()
     {
          p.alive = false;
          setTimeout(p.revive, 10000);
     }
     
     if (pli.wn != undefined)
          p.equipWeapon(pli.wn);
     
     if (pli.an != undefined)
          p.equipArmor(pli.an);

     
     p.id = pli.id;

     for (pr = 0; pr < p.property.length; pr++)
     {
          for (ss = 0; ss < world.structures.length; ss++)
               if (world.structures[ss].id == p.property[pr])
               {
                    world.structures[ss].owner = p;
                    if (world.structures[ss].n == "house")
                         p.house = world.structures[ss];
               }
               
          for (uu = 0; uu < world.units.length; uu++)
               if (world.units[uu].id == p.property[pr])
                    world.units[uu].owner = p;
     }

     p.spellBook = pli.spellBook;

     for (sp = 0; sp < p.spells.length; sp++)
          p.spells[sp] = spells[p.spells[sp]];
     
     for (g in world.guilds)
     {
          for (m in world.guilds[g].members)
               if (p.id == world.guilds[g].members[m])
               {
                    world.guilds[g].members[m] = p;
                    p.guild = world.guilds[g];
                    if (p.guild.o == p.id)
                         p.guild.o = p;
               }
               
          for (a in world.guilds[g].app)
               if (p.id == world.guilds[g].app[a])
                    world.guilds[g].app[a] = p;
                    
          for (ac in world.guilds[g].accepted)
               if (p.id == world.guilds[g].accepted[ac])
               {
                    world.guilds[g].memberJoin(p);
                    p.inventory.push(5);
               }
     }
     
     p.socket.on("update", function (data)
     {
          p.parsedData = pars(data, p);
          setTimeout(function()
          {
               p.socket.emit("update", {"self": p.parsedData});
          }, 10);
     });              

     p.socket.on("screensize", function(data)
     {
          if (data.sx > sx)
               p.sx = sx;
          else
               p.sx = data.sx;
          
          if (data.sy > sy)
               p.sy = sy;
          else
               p.sy = data.sy;
     });

     p.socket.on("chat", function (data)
     {
          game_socket.sockets.emit("chat", {"msg": p.n.n + " said: " + data.chat});
     });     

     socket.on("disconnect", function(data)
     {
          logout(p.n);
     });

     players.push(p);
}

pars = function(data, p)
{
     p.to = seeing(p); //this is an array of a
     p.seeing = {"dynamic": seeingDynamic(p), "static": seeingStatic(p)};

     var date = new Date();

     if (data.pressed.chat == undefined && p.alive)
     {
     if (data.pressed.mousePos != undefined)
     {
          p.mouse.x = data.pressed.mousePos.x;
          p.mouse.y = data.pressed.mousePos.y;
     }

     if (data.pressed.right)
     {
          p.rect[0] += (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
          p.img = [3, 2];

          if (p.an != undefined)
               p.a.img = items[p.an].imgs.lr;

          p.limbs.armLeft.offset = [p.rect[2]/2 - p.limbs.armLeft.wh[0]/2, 10];
          p.limbs.LegLeft.offset = [p.rect[2]/2 - p.limbs.LegLeft.wh[0]/2, 26];
          p.limbs.armRight.offset = [p.rect[2]/2 - p.limbs.armRight.wh[0]/2, 10];
          p.limbs.LegRight.offset = [p.rect[2]/2 - p.limbs.LegRight.wh[0]/2, 26];
          p.side = "right";
     }
     
     if (data.pressed.left)
     {
          p.rect[0] -= (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
          p.img = [3, 3];

          if (p.an != undefined)
               p.a.img = items[p.an].imgs.lr;

          p.limbs.armLeft.offset = [p.rect[2]/2 - p.limbs.armLeft.wh[0]/2, 10];
          p.limbs.LegLeft.offset = [p.rect[2]/2 - p.limbs.LegLeft.wh[0]/2, 26];
          p.limbs.armRight.offset = [p.rect[2]/2 - p.limbs.armRight.wh[0]/2, 10];
          p.limbs.LegRight.offset = [p.rect[2]/2 - p.limbs.LegRight.wh[0]/2, 26];
          
          p.side = "left";
     }
     
     if (data.pressed.up)
     {
          p.rect[1] -= (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
          p.img = [3, 1];

          if (p.an != undefined)
               p.a.img = items[p.an].imgs.ud;
          
          p.limbs.armLeft.offset = [-2, 10];
          p.limbs.LegLeft.offset = [1, 26];
          p.limbs.armRight.offset = [8, 10];
          p.limbs.LegRight.offset = [5, 26];
     }
     
     if (data.pressed.down)
     {
          p.rect[1] += (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
          p.img = [3, 0];

          if (p.an != undefined)
               p.a.img = items[p.an].imgs.ud;
          
          p.limbs.armLeft.offset = [-2, 10];
          p.limbs.LegLeft.offset = [1, 26];
          p.limbs.armRight.offset = [8, 10];
          p.limbs.LegRight.offset = [5, 26];
     }
     
     if (data.pressed.one)
          p.input.one = true;


     if (!(data.pressed.one) && p.input.one && date.getTime() - p.input.oneLast > generalCooldown)
     {
          p.input.one = false;
          p.input.oneLast = date.getTime();
          p.spells[0](p);
     }

     if (data.pressed.two)
          p.input.two = true;

     if (!(data.pressed.two) && p.input.two && date.getTime() - p.input.twoLast > generalCooldown)
     {
          p.input.two = false;
          p.input.twoLast = date.getTime();
          p.spells[1](p);         
     }
     
     if (data.pressed.three)
          p.input.three = true;
      
     if (!(data.pressed.three) && p.input.three && date.getTime() - p.input.threeLast > generalCooldown)
     {
          p.input.three = false;
          p.input.threeLast = date.getTime();
          p.spells[2](p);
     }

     if (data.pressed.four)
          p.input.four = true;

     if(!(data.pressed.four) && p.input.four && date.getTime() - p.input.fourLast > generalCooldown)
     {
          p.input.four = false; 
          p.input.fourLast = date.getTime();
          p.spells[3](p);
     }

     if (data.pressed.five) //ja znam kad je koj gumb pritisnut, koristim globalne varijable tu - NE.
          p.input.five = true;

     if(!(data.pressed.five) && p.input.five && date.getTime() - p.input.fiveLast > generalCooldown)
     {
          p.input.five = false; 
          p.input.fiveLast = date.getTime();
          p.spells[4](p);
     }

     if (data.pressed.six) //ja znam kad je koj gumb pritisnut, koristim globalne varijable tu - NE.
          p.input.six = true;

     if(!(data.pressed.six) && p.input.six && date.getTime() - p.input.sixLast > generalCooldown)
     {
          p.input.six = false; 
          p.input.sixLast = date.getTime();
          p.spells[5](p);
     }
     
     if (data.pressed.seven) //ja znam kad je koj gumb pritisnut, koristim globalne varijable tu - NE.
          p.input.seven = true;

     if(!(data.pressed.seven) && p.input.seven && date.getTime() - p.input.sevenLast > generalCooldown)
     {
          p.input.seven = false; 
          p.input.sevenLast = date.getTime();
          p.spells[6](p);
     }
     
     if (data.pressed.eight) //ja znam kad je koj gumb pritisnut, koristim globalne varijable tu - NE.
          p.input.eight = true;

     if(!(data.pressed.eight) && p.input.eight && date.getTime() - p.input.eightLast > generalCooldown)
     {
          p.input.eight = false; 
          p.input.eightLast = date.getTime();
          p.spells[7](p);
     }
     }
     
     if (data.pressed.ui != undefined)
     {
          for (sp = 0; sp < data.pressed.ui.s.length; sp++)
               p.spells[sp] = spells[data.pressed.ui.s[sp]];
               
          //p.spellBook = data.pressed.ui.sb;
     }
     
     for (ob = 0; ob < p.to.length; ob++)
     {
          var w = p.to[ob].rect[2];
          var h = p.to[ob].rect[3];

          var x = p.to[ob].rect[0];
          var y = p.to[ob].rect[1];

          if (collision(p.rect, p.to[ob].rect))
               p.to[ob].colWP = true;
          else
               p.to[ob].colWP = false;

          if (p.rect[0] > x && p.rect[0] < x + w && p.rect[1] + p.rect[3] > y + h - w + w/2 && p.rect[1] + p.rect[3] < y + h && p.to[ob].type != "enemy" && p.to[ob].type != "unit" && p.to[ob].type != "player" && !(p.to[ob] instanceof liveItem)) 
          {
               p.to[ob].collision = true;

               if (data.pressed.right)
               {
                    p.rect[0] -= (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
                    p.img = [3, 2];
               }
             
               if (data.pressed.left)
               {
                    p.rect[0] += (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
                    p.img = [3, 3];
               }
             
               if (data.pressed.up)
               {
                    p.rect[1] += (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
                    p.img = [3, 1];
               }
             
               if (data.pressed.down)
               {
                    p.rect[1] -= (p.speed.val * (1 + Math.sqrt(p.talents.speed)/10) * (date.getTime() - p.speed.lastCheck))/25;
                    p.img = [3, 0];
               }
               
               /*
               if (p.rect[1] + p.rect[3] - (p.speed.val * (1 + p.talents.speed/(p.talents.speed + 1)) * (date.getTime() - p.speed.lastCheck))/25 >= y + h - w + w/2 && p.rect[1] + (p.speed.val * (date.getTime() - p.speed.lastCheck))/25 + p.rect[3] <= y + h)
               {
                    if (data.pressed.right)
	                    p.rect[0] -= (p.speed.val * (1 + p.talents.speed/(p.talents.speed + 1)) * (date.getTime() - p.speed.lastCheck))/25;
                         
                    if (data.pressed.left)
	                    p.rect[0] += (p.speed.val * (1 + p.talents.speed/(p.talents.speed + 1)) * (date.getTime() - p.speed.lastCheck))/25;
               } 	

               if (p.rect[0] - (p.speed.val * (1 + p.talents.speed/(p.talents.speed + 1)) * (date.getTime() - p.speed.lastCheck))/25 >= x && p.rect[0] + (p.speed.val * (date.getTime() - p.speed.lastCheck))/25 <= x + w)
               {
                    if (data.pressed.up)
	                    p.rect[1] += (p.speed.val * (1 + p.talents.speed/(p.talents.speed + 1)) * (date.getTime() - p.speed.lastCheck))/25;

                    if (data.pressed.down)
                         p.rect[1] -= (p.speed.val * (1 + p.talents.speed/(p.talents.speed + 1)) * (date.getTime() - p.speed.lastCheck))/25;
               }
               */
          }
          
          else
               p.to[ob].collision = false;
     }

     if (data.pressed.mouse.click && data.pressed.mouse.button == 1)
     {
          found = false;
           
          for (o = 0; o < p.to.length; o++)
               if (data.pressed.mouse.x - (p.to[o].rect[0] - p.rect[0] + p.sx/2)*data.pressed.zoom >= 0 && data.pressed.mouse.x - (p.to[o].rect[0] - p.rect[0] + p.sx/2)*data.pressed.zoom <= p.to[o].rect[2]*data.pressed.zoom && data.pressed.mouse.y - (p.to[o].rect[1] - p.rect[1] + p.sy/2)*data.pressed.zoom >= 0 && data.pressed.mouse.y - (p.to[o].rect[1] - p.rect[1] + p.sy/2)*data.pressed.zoom <= p.to[o].rect[3]*data.pressed.zoom)
               {
                    found = true;
                    if (p.to[o] instanceof liveItem)
                    {
                         p.inventory.push(p.to[o].br)
                         liveItems = sliceHere(liveItems, liveItems.indexOf(p.to[o]));
                    }
                    else
                    {
                         p.target = p.to[o];
                    }
               }    
                                   
          if (!(found))
               p.target = false;
     }
     else if (data.pressed.mouse.click && data.pressed.mouse.button == 3)
          for (unit = 0; unit < world.units.length; unit++)
               if (p.target == world.units[unit] && world.units[unit].owner == p)                                   
               {    
                    world.units[unit].spc = false;
                    for (obj = 0; obj < p.to.length; obj++)
                         if (collision([(p.rect[0] + data.pressed.mouse.x - p.sx/2)*data.pressed.zoom, (p.rect[1] + data.pressed.mouse.y - p.sy/2)*data.pressed.zoom, 13, 15], [p.to[obj].rect[0], p.to[obj].rect[1], p.to[obj].rect[2], p.to[obj].rect[3]]))
                         {
                              world.units[unit].spc = true;
                              world.units[unit].task = p.to[obj];
                         }          
                    
                    if (world.units[unit].spc)
                    {
                         world.units[unit].follow = [world.units[unit].task.rect[0] + Math.round(Math.random()*world.units[unit].task.rect[2]), world.units[unit].task.rect[1] + Math.round(Math.random()*world.units[unit].task.rect[3])];   
                         p.arrow.img = [6, 1];
                         p.arrow.rect[0] = world.units[unit].task.rect[0];
                         p.arrow.rect[1] = world.units[unit].task.rect[1];
                    }
                    else
                    {
                         world.units[unit].follow = [data.pressed.mouse.x - (p.sx/2 + (0 - p.rect[0]))*data.pressed.zoom, data.pressed.mouse.y - (p.sy/2 + (1 - p.rect[1]))*data.pressed.zoom];               
                         p.arrow.img = [6, 0];       
                         p.arrow.rect[0] = p.rect[0] + data.pressed.mouse.x*data.pressed.zoom - p.sx/2*data.pressed.zoom;// (sx/2 - p.rect[0])*data.pressed.zoom;//data.pressed.mouse.x + (sx/2 - )*data.pressed.zoom;
                         p.arrow.rect[1] = p.rect[1] + data.pressed.mouse.y*data.pressed.zoom - p.sy/2*data.pressed.zoom;// (sy/2 - p.rect[1])*data.pressed.zoom;//data.pressed.mouse.y + (sy/2 - p.rect[1])*data.pressed.zoom;
                    }
          
                    world.units[unit].speed.lastCheck = date.getTime();
               }         
               
     if (p.level.xpCurrent >= p.level.xpMax)
     {         
          p.level.level++;
          p.level.xpCurrent = 0;
          
          p.level.xpMax = p.level.xpMax*2; 
          p.talents.points ++;
          
          p.skills.woodCutting ++;
          p.skills.attack ++;
          p.skills.building.wood ++;
          
          p.attackDamage.push(["LEVEL " + p.level.level + " REACHED!", [p.rect[0], p.rect[1] - 50, p.rect[2], p.rect[3]], "(50, 10, 250, ", 1, 5000])
                    
          setTimeout(function(){p.attackDamage.push(["Woodcutting +1", [p.rect[0] + 150, p.rect[1] - 100, p.rect[2], p.rect[3]], "(50, 250, 50, ", 1, 6000])},  Math.random()*500);
          setTimeout(function(){p.attackDamage.push(["Attack +1",      [p.rect[0] + 00, p.rect[1] - 100, p.rect[2], p.rect[3]], "(250, 10, 50, ", 1, 6000])},  Math.random()*500);
          setTimeout(function(){p.attackDamage.push(["Building (wood) +1",    [p.rect[0] - 150, p.rect[1] - 100, p.rect[2], p.rect[3]], "(150, 150, 10, ", 1, 6000])}, Math.random()*500);
     }         
     
     p.speed.lastCheck = date.getTime();
     
     if (p.target != false && p.target != undefined)
          if (p.target.health.current <= 0)
               p.target = false;

     if (p.wn != undefined)
     {     
          p.w.rect[0] = p.rect[0] - p.w.rect[2]/2 + p.rect[2]/2 + p.w.offset[p.side][0];
          p.w.rect[1] = p.rect[1] + p.rect[3]/2 - p.w.rect[3]/2 + p.w.offset[p.side][1];

          p.w.img = items[p.wn].imgs[p.side];
     }
     
     if (p.target != undefined && p.target != false)
          p.seeing.dynamic.push({"img": p.arrow.img, "rect": [p.arrow.rect[0], p.arrow.rect[1], p.arrow.rect[2], p.arrow.rect[3]]});     
     
     if (p.target != false && p.target != undefined)
     {
          trgt =
          {
               "id": p.target.id,
               "rect": p.target.rect,
               "health": p.target.health,
               "n": p.target.n
          }
          if (p.target.level != undefined)
               if (p.target.level.level != undefined)
                    trgt.n = "Level " + p.target.level.level + " " + trgt.n;
               else
                    trgt.n = "Level " + p.target.level + " " + trgt.n;
     }
     else
          trgt = false;

     if (p.talents.points > 0)
     {     
          if (data.pressed.options == "attack")
          {
               p.talents.attack++;
               p.talents.points--;
          }

          if (data.pressed.options == "speed")
          {
               p.talents.speed++;
               p.talents.points--;
          }

          if (data.pressed.options == "effect")
          {
               p.talents.effect++;
               p.talents.points--;
          }
     }
     
     var limbs = new Array();
     for (l in p.limbs)
          limbs.push({"style": p.limbs[l].style, "wh": p.limbs[l].wh, "rect": p.limbs[l].rect, "offset": p.limbs[l].offset});
               
     var ret =
     {
          "seeing": p.seeing.dynamic,
          "level": p.level, 
          "health": p.health,    
          "rect": p.rect,
          "w": p.w, 
          "a": p.a,  
          "mana": p.mana,
          "speed": p.speed,  
          "resources": p.resources,
          "skills": p.skills,
          "target": trgt, 
          "hours": new Date().getHours(),
          "mins": new Date().getMinutes(),
          "alive": p.alive,
          "limbs": limbs,
          "img": p.img
     };

     if (p.sound != undefined && p.sound != false)
     {    
          ret.sound = p.sound;
          p.sound = false;
     }         
               
     /*if (!(p.sentDA))
     {    
          ret.alive = p.alive;
          p.sentDA = true;
          console.log(ret.alive);
     } */   
          
     if (data.pressed.options == "talents")
     {    
          ret.options = {};
          ret.options.n = "talents";
          ret.talents = p.talents;
     }
     else if (data.pressed.options == "spellBook")
     {
          ret.options = {};
          ret.options.n = "spellBook";
          ret.spellBook = p.spellBook;
     }
     else if (data.pressed.options == "inventory")
     {
          ret.options = {};
          ret.options.n = "inventory";
          ret.inventory = p.inventory;
          ret.invImg = new Array();
          ret.invD = new Array();
          for (b = 0; b < p.inventory.length; b++)
          {
               ret.invImg.push(items[p.inventory[b]].img);
               ret.invD.push(items[p.inventory[b]].d);
          }
     }
     else if (data.pressed.options == "item")
     {
          items[p.inventory[data.pressed.item]].onClick(p);
          
          if(items[p.inventory[data.pressed.item]].type == "healthPotion" || items[p.inventory[data.pressed.item]].type == "manaPotion")
               p.inventory = sliceHere(p.inventory, data.pressed.item);

          ret.options = {};
          ret.options.n = "inventory";
          ret.inventory = p.inventory;
          ret.invImg = new Array();
          ret.invD = new Array();
          for (b = 0; b < p.inventory.length; b++)
          {
               ret.invImg.push(items[p.inventory[b]].img);
               ret.invD.push(items[p.inventory[b]].d);
          }
     }
     else if (data.pressed.options == "gg")
     {
          yes = true;
          
          for (g in world.guilds)
               for (m in world.guilds[g].members)
                    if (world.guilds[g].members[m] == p)
                         yes = false;
          if (yes)
          {
               ret.options = {};
               ret.options.n = "hg";
               
               ret.options.ag = new Array();
               
               for (g in world.guilds)
                    ret.options.ag.push(world.guilds[g].pack());
          }
          else
          {
               ret.guild = world.guilds[g].pack();
               ret.options = {};
               ret.options.n = "jg";
          }
     }
     else if (data.pressed.options == "ss")
     {
          ret.options = {}
          ret.options.n = "stats";
          
          ret.options.stats = {"talents": p.talents, "skills": p.skills, "cinfo": {"level": p.level, "n": p.n.n}};

          if (p.a != undefined)
               ret.options.stats.cinfo.armor = p.a.armorVal
     }
     else if (data.pressed.options == "ga")
     {
          ret.options = {};
          ret.options.n = "ach";
          ret.options.aa = p.achievements;
     }
     else if (data.pressed.options == "acceptApp")
     {
          if (p.guild.o.n.n == p.n.n)
          {
               for (a in p.guild.app)
               {
                    if (p.guild.app[a] instanceof Player)
                    {
                         if (p.guild.app[a].id == data.pressed.an)
                         {
                              world.guilds[g].memberJoin(p.guild.app[a]);
                              p.guild.app[a].inventory.push(5);
                         }
                    }
                    else
                         p.guild.accepted.push(p.guild.app[a]);
               }
          }
     }
     else if (data.pressed.options == "joinGuild")
     {
          yes = true;
          for (g in world.guilds)
               for (m in world.guilds[g].members)
                    if (world.guilds[g].members[m] == p)
                         yes = false;
          if (yes)
               for (g in world.guilds)
                    if (world.guilds[g].n == data.pressed.jwg)
                         world.guilds[g].app.push(p);
     }
     else if (data.pressed.options == "createGuild")
     {
          yes = true;
          for (g in world.guilds)
               for (m in world.guilds[g].members)
                    if (world.guilds[g].members[m] == p)
                         yes = false;
          
          if (yes)
          {
               new Guild({"n": data.pressed.gldn, "o": p, "members": [p.id], "app": new Array()});
               p.guild = world.guilds[world.guilds.length - 1];
               p.socket.emit("created", {"info": world.guilds[world.guilds.length - 1].pack()});
               p.inventory.push(5);
          }
     }

     if (data.pressed.quests != undefined)
     {
          if (data.pressed.quests == "accept")
               for (ob = 0; ob < p.to.length; ob++)
                    if (p.to[ob].quests != undefined)
                         if (p.to[ob].quests[0] == p.maybeQuest)
                         {
                              p.quests.push(p.maybeQuest);
                              ret.options = {};
                              ret.options.id = p.to[ob].id;
                              ret.options.quest = p.to[ob].quests[0];
                              ret.options.n  = "acceptedQuest";
                         }

          for (ob = 0; ob < p.to.length; ob++)
          {
               if (p.quests[0] != undefined && p.to[ob].quests != undefined)
               {
                    if (p.to[ob].id == data.pressed.quests && p.quests[0].n != p.to[ob].quests[0].n)
                    {
                         p.maybeQuest = p.to[ob].quests[0];
                         ret.options = {};
                         ret.options.quest = p.to[ob].quests[0];
                         ret.options.n = "quests";
                    }
               }               
               else
               {
                    if (p.to[ob].id == data.pressed.quests)
                    {
                         p.maybeQuest = p.to[ob].quests[0];
                         ret.options = {};
                         ret.options.quest = p.to[ob].quests[0];
                         ret.options.n = "quests";               
                    }
               }
          }
     }
     
     for (qss = 0; qss < p.quests.length; qss++)
          for (ch = 0; ch < checks.length; ch++)
               if (p.quests[qss] != undefined)
               if (p.quests[qss].check == checks[ch].n)
               if (checks[ch].check(p, p.quests[qss]))

               for (ob = 0; ob < p.to.length; ob++)
                    if (p.to[ob].quests != undefined)
                         for (qsq = 0; qsq < p.to[ob].quests.length; qsq++)
                              if (p.quests[qss] == p.to[ob].quests[qsq])
                              {
                                   ret.options = {};
                                   ret.options.id = p.to[ob].id;
                                   ret.options.n = "completedQuest";

                                   for (c = 0; c < complete.length; c++)
                                        if (p.quests[qss].complete == complete[c].n)
                                        {
                                             complete[c].complete(p, p.quests[qss]);
                                             p.level.xpCurrent += p.quests[qss].xp;
                                             p.attackDamage.push(["+" + p.quests[qss].xp + "xp", p.rect, "(150, 10, 150, ", 1]);
                                        }
                                   ret.options.donewith = p.quests[qss].n;
                                   p.quests = sliceHere(p.quests, qss);
                                   ret.options.quests = p.quests;
                              }
     
     if (p.attackDamage.length > 0)
     {
          ret.ads = new Array();
          for(ad = 0; ad < p.attackDamage.length; ad++)
          {
               ret.ads[ad] = new Array();
               ret.ads[ad][0] = p.attackDamage[ad][0];
               ret.ads[ad][1] = p.attackDamage[ad][1];
               ret.ads[ad][2] = p.attackDamage[ad][2];
               ret.ads[ad][3] = p.attackDamage[ad][3];
               ret.ads[ad][4] = p.attackDamage[ad][4];
          }
          
          p.attackDamage = new Array();
     }
     
     return ret
}

var date = new Date();             
var players = new Array();
var info = new Array();
var buildings = new Array();
var items = new Array();

//type, n, rect, img, args

/*var weapons = new Array();
var armor = new Array();

new Weapon("Vile", [4, 0], 10, [0, 0, 50, 16]); //this is how you creat
new Armor("Claps", [5, 0], 10, [0, 0, 25, 9]);
*/

new Item("weapon", "Vile", [50, 16], {"right": [4, 0], "left": [4, 3]}, "Weak and basic, 10 damage.", {"damage": 10, "offset": {"right": [0, 0], "left": [0, 0]}}, function(p){p.equipWeapon(0);}); //0
new Item("armor", "Claps", [25, 9], {"ud": [5, 0], "lr": [5, 1]}, "Weak and basic, armor value is 10.", {"armorVal": 10}, function(p){p.equipArmor(1);}); //1

new Item("healthPotion", "Health Potion (50)", [42, 42], [11, 0], "Gives you 50 hp.", {"healthVal": 50}, function(p) //2
{
     if (p.health.current + 50 > p.health["max"] && p.health.current != p.health["max"])
     {
          p.attackDamage.push(["+" + (p.health["max"] - p.health.current), p.rect, "(5, 230, 5, ", 1, 2000]);
          p.health.current = p.health["max"];
     }
     else if (p.health.current == p.health["max"])
     {
          p.attackDamage.push(["Full", p.rect, "(250, 50, 5, ", 1, 2000]);
     }
     else
     {
          p.attackDamage.push(["+50", p.rect, "(20, 250, 20, ", 1, 2000]);
          p.health.current += 50;
     }
});

new Item("weapon", "Sword", [50, 16], {"right": [4, 1], "left": [4, 4]}, "20 Damage.", {"damage": 20, "offset": {"right": [20, 0], "left": [-20, 0]}}, function(p){p.equipWeapon(3);});//3
new Item("placeholder", "Wooden arrow", [28, 3], [4, 2], "Basic wooden arrow.", {}, function(p){}); //4
new Item("shirt", "Guild tabbard", undefined, [13, 0], "Given to you by your guild.", {"color": "rgba(20, 20, 200, 1)"}, function(p){p.changeC(5);});//5

new Item("manaPotion", "Mana Potion (50)", [42, 42], [11, 1], "Gives you 50 mp.", {"manaVal": 50}, function(p) //6
{
     if (p.mana.current + 50 > p.mana["max"] && p.mana.current != p.mana["max"])
     {
          p.attackDamage.push(["+" + (p.mana["max"] - p.mana.current), p.rect, "(5, 5, 235, ", 1, 2000]);
          p.mana.current = p.mana["max"];
     }
     else if (p.mana.current == p.mana["max"])
     {
          p.attackDamage.push(["Full", p.rect, "(250, 50, 5, ", 1, 2000]);
     }
     else
     {
          p.attackDamage.push(["+50", p.rect, "(20, 20, 250, ", 1, 2000]);
          p.mana.current += 50;
     }
});

new Item("shirt", "Basic shirt", undefined, [13, 1], "This is the basic shirt worn by the people.", {"color": "rgba(152, 115, 70, 1)"}, function(p){p.changeC(7);});//7

liveItems = new Array();

liveItem = function(scheme, rect, br)
{
     var i = this;
     
     i.type = scheme.type;
     i.n = scheme.n;
     i.wh = scheme.wh;
     i.img = scheme.img; 
     i.rect = rect;
     i.br = br;
     i.sd = "dynamic";
     i.x = ([liveItems.length].slice())[0];
     i.health = {"current": 10, "max": 10};
          
     if (i.type == "weapon")
          i.damage = scheme.damage;
     else if (i.type == "armor")
          i.armorVal = scheme.armorVal; 
     else if (i.type == "healthPotion")
          i.healthVal = scheme.healthVal;
     else if (i.type == "manaPotion")
     {
          i.manaVal = args.manaVal;
          i.img = img;
     }
     else if (i.type == "shirt")
     {
          i.color = args.color;
          i.img = img;
     }
     
     liveItems.push(i);
}

new Building([1, 1], [{"from": 0, "to": 50, "img":[1, 1], "maxUnits": 0, "interval": 10000}, {"from": 50, "to": 1000000, "img":[1, 0], "maxUnits": 5, "interval": 50000}], [0, 0, 141, 170], [10, 0, 0, 5], {"current": 0, "max": 100}, true, undefined, "house"); //0
new Building([1, 2], undefined,                                                                                                                                           [0, 0, 40, 160], [10, 0, 0, 0], {"current": 0, "max": 100}, false, undefined, "wall"); // 1
new Building([1, 1], [{"from": 0, "to": 50, "img":[1, 1], "maxUnits": 0, "interval": 10000}, {"from": 50, "to": 1000000, "img":[1, 3], "maxUnits": 10, "interval": 50000}], [0, 0, 141, 170], [10, 10, 2, 3], {"current": 0, "max": 100}, false, "guild", "guildHouse"); //2

var worldBuff = JSON.parse(fs.readFileSync("info/world.json"));
var users = JSON.parse(fs.readFileSync("info/users.json"));

var world = {"spawnPoint": worldBuff.spawnPoint, "size": worldBuff.size, "spawns": worldBuff.spawns, "factions": new Array(), "trees": new Array(), "guilds": new Array(), "rocks": new Array(), "enemies": new Array(), "structures": new Array(), "npcs": new Array(), "units": new Array(), "id": worldBuff.id};

load();

setInterval(function()
{
     save();
}, 30000);

game_socket.sockets.on("connection", function (socket)
{
     socket.on("register", function (data)
     {
          socket.emit("got", {good: newUser(data.n, data.p, data.email, data.faction)});
     });

     socket.on("login", function (data)
     {
          player = auth(data.n, data.p, socket);
          socket.emit("got", {good: player.good});
          
          socket.infogot = {"data": data, "player": player};
     });

     socket.on("done", function (datax)
     {
          if (player.good)
               socket.emit("init", {"pli": player.pli, "world": pack()});

          var pl = new Player(socket.infogot.data, socket, socket.infogot.player.pli);

          for (g in world.guilds)
               for (m in world.guilds[g].members)
                    if (pl.id == world.guilds[g].members[m])
                    {
                         world.guilds[g].members[m] = pl;
                         pl.guild = world.guilds[g];
                    }
     });
});

absolute = function(num)
{
     if (num < 0) 
          return num*(-1);
     else
          return num;
}

setInterval(function()
{
     var dateE = new Date();
     objects = world.trees.concat(world.enemies, world.structures, players, world.units, world.npcs, arrows, liveItems, world.rocks);

     for (tr = 0; tr < world.trees.length; tr++)
          if (world.trees[tr].health.current <= 0)
          {
               game_socket.sockets.emit("delStatic", {"id": world.trees[tr].id});
               world.trees = sliceHere(world.trees, tr);
          }

     for (tr = 0; tr < world.rocks.length; tr++)
          if (world.rocks[tr].health.current <= 0)
          {
               game_socket.sockets.emit("delStatic", {"id": world.rocks[tr].id});
               world.rocks = sliceHere(world.rocks, tr);
          }


     for (en = 0; en < world.enemies.length; en++)
     {
          if (world.enemies[en].follow != false && (world.enemies[en].inCombatWith == false || world.enemies[en].inCombatWith == undefined))
          {
               world.enemies[en].toM = whereFollowing([world.enemies[en].rect[0], world.enemies[en].rect[1]], world.enemies[en].follow, world.enemies[en].speed, new Date().getTime());
               world.enemies[en].rect[0] += world.enemies[en].toM[0];
               world.enemies[en].rect[1] += world.enemies[en].toM[1];
               
               if (world.enemies[en].toM[0] > 0)
               {
                    world.enemies[en].img = world.enemies[en].si[1];
                    
                    world.enemies[en].limbs.armLeft.offset = world.enemies[en].limbsO.right.armLeft;
                    world.enemies[en].limbs.LegLeft.offset = world.enemies[en].limbsO.right.LegLeft;
                    world.enemies[en].limbs.armRight.offset = world.enemies[en].limbsO.right.armRight;
                    world.enemies[en].limbs.LegRight.offset = world.enemies[en].limbsO.right.LegRight;
               }
               else
               {
                    world.enemies[en].img = world.enemies[en].si[0];

                    world.enemies[en].limbs.armLeft.offset = world.enemies[en].limbsO.left.armLeft;
                    world.enemies[en].limbs.LegLeft.offset = world.enemies[en].limbsO.left.LegLeft;
                    world.enemies[en].limbs.armRight.offset = world.enemies[en].limbsO.left.armRight;
                    world.enemies[en].limbs.LegRight.offset = world.enemies[en].limbsO.left.LegRight;
               }
               
               world.enemies[en].speed.lastCheck = new Date().getTime(); 
          }

          for (a = 0; a < arrows.length; a++)
               if (collision(world.enemies[en].rect, arrows[a].rect))
               {
                    world.enemies[en].speed.lastCheck = dateE.getTime();
                    world.enemies[en].inCombatWith = arrows[a].owner;
                    world.enemies[en].health.current -= arrows[a].health;
                    world.enemies[en].rect[0] -= arrows[a].where[0]*arrows[a].owner.talents.effect;
                    world.enemies[en].rect[1] -= arrows[a].where[1]*arrows[a].owner.talents.effect;
                    arrows[a].owner.target = world.enemies[en];
                    arrows[a].owner.attackDamage.push([arrows[a].health, arrows[a].rect, "(250, 250, 250, ", 1, 2000]);
                    arrows[a].fall();
               }
          
          if (world.enemies[en].inCombatWith != undefined && world.enemies[en].inCombatWith != false)
          {
               if (world.enemies[en].inCombatWith.alive != true)
                    world.enemies[en].inCombatWith = false;

               if (world.enemies[en].inCombatWith.rect != undefined)
               {
                    world.enemies[en].toM = whereFollowing([world.enemies[en].rect[0], world.enemies[en].rect[1]], [world.enemies[en].inCombatWith.rect[0] + world.enemies[en].inCombatWith.rect[2]/2 + 5, world.enemies[en].inCombatWith.rect[1] + world.enemies[en].inCombatWith.rect[3]/2], world.enemies[en].speed, dateE.getTime());
                              
                    if (absolute(world.enemies[en].rect[0] - world.enemies[en].inCombatWith.rect[0]) > 25)
                         world.enemies[en].rect[0] += world.enemies[en].toM[0];
                    if (absolute(absolute(world.enemies[en].rect[1] - (world.enemies[en].inCombatWith.rect[1] + world.enemies[en].inCombatWith.rect[3]/2)) > 25))
                         world.enemies[en].rect[1] += world.enemies[en].toM[1];
                    
                    world.enemies[en].speed.val = 1.5;
                    world.enemies[en].speed.lastCheck = dateE.getTime();

                    if (world.enemies[en].toM[0] > 0)
                    {
                         world.enemies[en].img = world.enemies[en].si[1];

                         world.enemies[en].limbs.armLeft.offset = world.enemies[en].limbsO.right.armLeft;
                         world.enemies[en].limbs.LegLeft.offset = world.enemies[en].limbsO.right.LegLeft;
                         world.enemies[en].limbs.armRight.offset = world.enemies[en].limbsO.right.armRight;
                         world.enemies[en].limbs.LegRight.offset = world.enemies[en].limbsO.right.LegRight;
                    }
                    else
                    {
                         world.enemies[en].img = world.enemies[en].si[0];

                         world.enemies[en].limbs.armLeft.offset = world.enemies[en].limbsO.left.armLeft;
                         world.enemies[en].limbs.LegLeft.offset = world.enemies[en].limbsO.left.LegLeft;
                         world.enemies[en].limbs.armRight.offset = world.enemies[en].limbsO.left.armRight;
                         world.enemies[en].limbs.LegRight.offset = world.enemies[en].limbsO.left.LegRight;
                    }

                    if ((absolute(world.enemies[en].rect[0] - world.enemies[en].inCombatWith.rect[0]) < 30 && absolute(world.enemies[en].rect[1] - (world.enemies[en].inCombatWith.rect[1] + world.enemies[en].inCombatWith.rect[3]/2)) < 30) && new Date().getTime() - world.enemies[en].lastAttack > generalCooldown)
                    {
                         world.enemies[en].lastAttack = new Date().getTime();

                         if (world.enemies[en].inCombatWith.a != undefined)
                              var damage = world.enemies[en].skills.attack - world.enemies[en].inCombatWith.a.armorVal;
                         else
                              var damage = world.enemies[en].skills.attack;
     
                         if (damage <= 0)
                              damage = world.enemies[en].skills.attack / world.enemies[en].inCombatWith.a.armorVal;     

                         world.enemies[en].inCombatWith.health.current -= damage;
                    }
           
                    if (world.enemies[en].health.current <= 0)
                    {
                         world.enemies[en].inCombatWith.level.xpCurrent += 10;

                         if (world.enemies[en].inCombatWith instanceof Unit)
                         {
                              world.enemies[en].inCombatWith.owner.attackDamage.push(["+10xp", world.enemies[en].inCombatWith.rect, "(150, 10, 150, ", 1, 3000]);
                              world.enemies[en].inCombatWith.owner.dogKill++;
                         }
                         else
                         {
                              world.enemies[en].inCombatWith.dogKill++;
                              world.enemies[en].inCombatWith.attackDamage.push(["+10xp", world.enemies[en].inCombatWith.rect, "(150, 10, 150, ", 1, 3000]);
                              world.enemies[en].inCombatWith.target = false;
                         }
                         
                         for (it = 0; it < world.enemies[en].drop.length; it++)
                         {
                              chance = Math.round(Math.random()*world.enemies[en].drop[it].dropChance);
                              if (chance == 0)
                                   new liveItem(items[world.enemies[en].drop[it].br], [world.enemies[en].rect[0] + Math.random()*50, world.enemies[en].rect[1] + Math.random()*50, items[world.enemies[en].drop[it].br].wh[0], items[world.enemies[en].drop[it].br].wh[1]], world.enemies[en].drop[it].br);
                         }
                         
                         world.enemies = sliceHere(world.enemies, en);
                    }
               }
          }

          if (world.enemies[en].health.current <= 0)
               world.enemies = sliceHere(world.enemies, en);

          else
               if (world.enemies[en].toM != undefined)
                    world.enemies[en].lastMove = world.enemies[en].toM;
               else
                    world.enemies[en].lastMove = [0, 1];
     }
     
     
     for (plp = 0; plp < players.length; plp++)
     {
          for (a in achievements)
          {
               yes = true;
               
               for (ac in players[plp].achievements)
                    if (players[plp].achievements[ac] == achievements[a])
                         yes = false;
                         
               if (achievements[a].check(players[plp]) && yes)
                    achievements[a].whenComplete(players[plp], achievements[a]);
          }
     
          if (players[plp].alive && players[plp].health.current <= 0)
               players[plp].die();
          
          if (players[plp].target != false && players[plp].target != undefined && players[plp].effect != false && players[plp].effect != undefined)
          {
               for (see = 0; see < players[plp].to.length; see++)
                    if (players[plp].to[see].rect != undefined)
                         if (collision(players[plp].target.rect, players[plp].to[see].rect) && players[plp].to[see].rect != players[plp].target.rect)
                         {                                            
                              players[plp].target.rect[0] -= 5;            
                              clearInterval(players[plp].effect);               
                              clearTimeout(players[plp].cancel);           
                              players[plp].effect = false;            
                              players[plp].cancel = false;                      
                         }                                                                
          }
     }                             
                         
     for (u = 0; u < world.units.length; u++)
     {
          if (world.units[u].health.current <= 0)
          {
               clearInterval(world.units[u].task);
               clearInterval(world.units[u].todo);
               for (en = 0; en < world.enemies.length; en++)
                    if (world.enemies[en].inCombatWith == world.units[u])
                         world.enemies[en].inCombatWith = false;

               world.units = sliceHere(world.units, u);
          }
     
          if (world.units[u] != undefined)
          if (world.units[u].follow != false && world.units[u].follow != undefined)
          {
               toM = whereFollowing([world.units[u].rect[0], world.units[u].rect[1]], world.units[u].follow, world.units[u].speed, dateE.getTime());
               
               world.units[u].rect[0] += toM[0];
               world.units[u].rect[1] += toM[1];
               
               world.units[u].speed.lastCheck = dateE.getTime();

               if (world.units[u].spc == false)
               {
                    if(collision(world.units[u].rect, [world.units[u].follow[0], world.units[u].follow[1], 13, 15]))
                         world.units[u].follow = false;
                         
                    clearInterval(world.units[u].todo);
               }
               else
                    if(collision(world.units[u].rect, world.units[u].task.rect))
                    {
                         if(world.units[u].task.type == "structure")
                         {
                              world.units[u].follow = false;
                              clearInterval(world.units[u].todo);
                              world.units[u].todo = setInterval(world.units[u].build, 1000);
                         }
                         else if(world.units[u].task.type == "enemy")
                         {
                              world.units[u].follow = false;
                              clearInterval(world.units[u].todo);
                              world.units[u].todo = setInterval(world.units[u].attack, 1000);
                         }
                         else if(world.units[u].task.type == "tree" || world.units[u].task.type == "rock")
                         {
                              world.units[u].follow = false;
                              clearInterval(world.units[u].todo);
                              world.units[u].todo = setInterval(world.units[u].gather, 1000);
                         }
                    }
          }
     }
}, 10);

Tree = function(pos)
{
     var t = this;
     t.stages = 
     [
          {"from": 100, "to":75, "img": [0, 0]},
          {"from": 75, "to": 50, "img": [0, 1]},
          {"from": 50, "to": 25, "img": [0, 2]},
          {"from": 25, "to": 0, "img": [0, 3]}
     ];
     t.rect = pos.concat([141, 141]);
     t.health = {"max": 100, "current": 100};
     t.currentStage = 0;
     t.img = [0, 0];
     t.type = "tree";
     t.n = "Tree";
     t.collision = false;
     t.sd = "static";
     t.id = world.id;
     
     world.id ++;
     world.trees.push(t);
}

Rock = function(pos)
{
     var r = this;

     r.type = "rock";
     r.rect = pos.concat([113, 108]);
     r.img = [12, 0];
     r.stages = [{"from": 200, "to": 0, "img": [12, 0]}];
     r.health = {"max": 200, "current": 200};
     r.collision = false;
     r.sd = "static";
     r.currentStage = 0;
     r.n = "Stone";

     r.id = world.id;
     world.id ++;
}


setInterval(function()
{
     for (ppl in players)
     {
          if(players[ppl].health.current < players[ppl].health["max"])
               players[ppl].health.current ++;
          
          if(players[ppl].mana.current < players[ppl].mana["max"])
               players[ppl].mana.current ++;
     }
}, 3000);

/*setInterval (function()
{
     for (var s in world.spawns)
     {
          if (world.spawns[s].thing.type == "tree")
               new Tree([world.spawns[s].loc[0] + Math.round(Math.random()*world.spawns[s].loc[2]), world.spawns[s].loc[1] + Math.round(Math.random()*world.spawns[s].loc[3])]);

          if (world.spawns[s].thing.type == "enemy")
          {
               if (world.spawns[s].loc != "all")
                    world.spawns[s].thing.subClass.rect = ([world.spawns[s].loc[0] + Math.round(Math.random()*world.spawns[s].loc[2]), world.spawns[s].loc[1] + Math.round(Math.random()*world.spawns[s].loc[3])]).concat(world.spawns[s].thing.subClass.wh);
               else
                    world.spawns[s].thing.subClass.rect = ([Math.round(Math.random()*world.size), Math.round(Math.random()*world.size)]).concat(world.spawns[s].thing.subClass.wh);
               
               world.spawns[s].thing.subClass.id = world.id;
               new Enemy(JSON.parse(JSON.stringify(world.spawns[s].thing.subClass)));//{"limbsO": world.spawns[s].thing.subClass.limbsO, "level": world.spawns[s].thing.subClass.level, "si": world.spawns[s].thing.subClass.si, "n": world.spawns[s].thing.subClass.n, "drop": world.spawns[s].thing.subClass.drop, "rect": ([world.spawns[s].loc[0] + Math.round(Math.random()*world.spawns[s].loc[2]), world.spawns[s].loc[1] + Math.round(Math.random()*world.spawns[s].loc[3])]).concat(world.spawns[s].thing.subClass.wh), "img": world.spawns[s].thing.subClass.img, "id": world.id, "health": world.spawns[s].thing.subClass.health, "speed": world.spawns[s].thing.subClass.speed, "skills": world.spawns[s].thing.subClass.skills, "limbs": world.spawns[s].thing.subClass.limbs});
               world.id ++;
          }

          if (world.spawns[s].thing.type == "stone")
               new Rock([world.spawns[s].loc[0] + Math.round(Math.random()*world.spawns[s].loc[2]), world.spawns[s].loc[1] + Math.round(Math.random()*world.spawns[s].loc[3])]);

     }
}, spawnInterval);*/

console.log("Server ready.");

/*
BUGS:
*/

//underscore, mongoDB, backbone
//CSS3 animation

/*

luka8088@owave.net

ovo je bez movement predictiona.

SERVER:
 - jednom pošalji cijelu mapu.
 - broadcasteaj sve promjene.
 - šalji svima dinamicne objekte, stalno.
                                                  
CLIENT:
 - primi cijelu mapu.
 - slušaj za promjene.
 - stalno odgovaraj kada ti pošalje dinamične.

*/

/*

ovo bi radilo samo za statičnu mapu, što kada se objekti sami od sebe kreću?
ovo je bez movement predictiona.

SERVER:
 - gledaj koji su objekti statični a koji se mogu kretati.
 - oni koji se mogu kretati: poziciju šalji stalno.
 - oni koji su statični - šalji svakih xs.
 
CLIENT:
 - kada primi kvadrat rekonstruiraj static object model.
 - stalno crtaj dinamične objekte.

*/


/*
 - different enemy types
 - trading
 - map generation (fix random, map editor)
*/


//BUGFIX: rocks didn't get removed when destroyed, search for delstatic and change the removal line to "rocks" instead of "trees".

//Deleting rocks still doesn't work! it's  a clientise problem. Also, when trees and rocks are spawned, the client isn't notified.

