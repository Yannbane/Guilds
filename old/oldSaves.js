pack = function()
{
     for (pp = 0; pp < players.length; pp++)
     {
          players[pp].property = new Array();
          for (ss = 0; ss < toSave.structures.length; ss++)
          {
               if (toSave.structures[ss].owner == players[pp])
               {
                    toSave.structures[ss].owner = undefined;
                    players[pp].property.push(toSave.structures[ss].id);
               }
          }

          for (uu = 0; uu < toSave.units.length; uu++)
          {
               if (toSave.units[uu].owner == players[pp])
               {
                    toSave.units[uu].owner = undefined;
                    players[pp].property.push(toSave.units[uu].id);
               }
               
               for (ee = 0; ee < toSave.enemies.length; ee++)
               {
                    if (toSave.units[uu].task == toSave.units[uu])
                    {
                         toSave.units[uu].task = toSave.units[uu].id;
                    }
               }               
          }
          
          for (ee = 0; ee < toSave.enemies.length; ee++)
          {
               if (toSave.enemies[ee].inCombatWith == players[pp])
               {
                    toSave.enemies[ee].inCombatWith = players[pp].n;
               }
               
               for (uu = 0; uu < toSave.units.length; uu++)
               {
                    if (toSave.enemies[ee].inCombatWith == toSave.units[uu])
                    {
                         toSave.enemies[ee].inCombatWith = toSave.units[uu].id;
                    }
               }
          }

          for (sp = 0; sp < players[pp].spells.length; sp++)
          {
               for (ssp = 0; ssp < spells.length; ssp++)
               {
                    if (players[pp].spells[sp] == spells[ssp])
                    {     
                         players[pp].spells[sp] = ssp;
                    }
               }
          }
     }
}


unpack = function()
{
     for (pp = 0; pp < players.length; pp++)
     {
          for (pr = 0; pr < players[pp].property.length; pr++)
          {
               for (ss = 0; ss < world.structures.length; ss++)
               {
                    if (world.structures[ss].id == players[pp].property[pr])
                    {
                         world.structures[ss].owner = players[pp];
                    }
               }

               for (uu = 0; uu < world.units.length; uu++)
               {
                    if (world.units[uu].id == players[pp].property[pr])
                    {
                         world.units[uu].owner = players[pp];
                    }
                    
                    for (ee = 0; ee < world.enemies.length; ee++)
                    {
                         if (world.units[uu].task == world.enemies[ee].id)
                         {
                              world.units[uu].task = world.enemies[ee];
                         }
                    }                    
               }
          }

          for (ee = 0; ee < world.enemies.length; ee++)
          {
               if (world.enemies[ee].inCombatWith == players[pp].n)
               {
                    world.enemies[ee].inCombatWith = players[pp];
               }
               for (uu = 0; uu < world.units.length; uu++)
               {
                    if (world.enemies[ee].inCombatWith == world.units[uu].id)
                    {
                         world.enemies[ee].inCombatWith == world.units[uu];
                    }
               }
          }

          for (sp = 0; sp < players[pp].spells.length; sp++)
          {
               players[pp].spells[sp] = spells[players[pp].spells[sp]];
          }
     }
}

realSave = function()
{
     for(ppp = 0; ppp < players.length; ppp++)
     {
          for (usss = 0; usss < users.length; usss++)
          {
               if (users[usss].n == players[ppp].n.n)
               {
                    users[usss].pli.property = players[ppp].property;
               }
          }
     }
     
     toSave = world;
     
     newE = new Array();
     
     for (e = 0; e < world.enemies.length; e++)
     {
          if (world.enemies[e].pack != undefined)
               newE.push(world.enemies[e].pack());
     }

     toSave.enemies = newE;

     pack();


     fs.open("info/users.json", "w", undefined, function(err, fd)
     {
          fs.write(fd, JSON.stringify(users), undefined, undefined, function(err, written)
          {
               fs.close(fd, function(err)
               {
                    if (err)
                    {    
                         return false
                    }
                    fs.open("info/world.json", "w", undefined, function(err2, fd2)
                    {
                         fs.write(fd, JSON.stringify(toSave), undefined, undefined, function(err2, written2)
                         {
                              fs.close(fd2, function(err2)
                              {
                                   if (err2)
                                   {
                                        return false
                                   }
                                   unpack();
                              });
                         });
                    });
               });
          });
     });
}

