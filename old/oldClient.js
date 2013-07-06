g = function(canvas, socket, sx, sy, nm)
{
	var self = this; 
     var did = false;
    
     self.socket = socket;
	self.canvas = canvas;
	self.screen = self.canvas.getContext('2d');
	self.sx = sx;
	self.sy = sy;
	self.defined = false;
     self.screen.fillStyle = "rgb(0, 150, 0)"	
     self.enemies = new Array();
     self.others = new Array();     
     self.date = new Date();
     self.info = document.getElementById("info");
     self.speed = {"val": 100/1000, "lastCheck": self.date.getTime()}
     self.dontDisplay = new Array();
     self.notQuest = true; 
     self.zoom = 1;
     self.mouse = {"x": 0, "y": 0};
     self.mouseBuffer = {"x": 0, "y": 0};
     self.offset = 0;
     input.chat = undefined;          
     self.loaded = 0;
     self.nPics = 0;
     self.invOffset = 0;
     self.invOffset2 = 0;

     self.sources =
      [
          [//trees, 0
               "res/images/enviornment/trees/tree_1_1.png",//0
               "res/images/enviornment/trees/tree_1_2.png",//1
               "res/images/enviornment/trees/tree_1_3.png",//2
               "res/images/enviornment/trees/tree_1_4.png",//3
          ],
          [//buildings, 1          
               "res/images/buildings/house_1.png",//0
               "res/images/buildings/house_1_2.png",//1
               "res/images/buildings/wall_1.png",//2
          ],
          [//enemies, 2          
               "res/images/enemies/helldog/helldogLeft.png",//0                                          
          ],
          [//races, 3          
               "res/images/races/human/playerDown.png",//0                                          
          ],
          [//weapons, 4
               "res/images/items/weapons/viler.png",//0
               "res/images/items/weapons/sword_1.png",//1
            
               //"res/images/items/weapons/vilel.png",//1
               //"res/images/items/weapons/viled.png",//2
               //"res/images/items/weapons/vileu.png",//3
               "res/images/items/weapons/arrow.png"//4
          ],
          [//armor, 5
               "res/images/items/armor/claps_ud.png",//0
               //"res/images/items/armor/claps_lr.png"//1
          ],
          [//utilities, 6
               "res/images/utilities/arrow.png",
               "res/images/utilities/arrow2.png",
               "res/images/utilities/quest.png",
          ],
          [//spellsUI, 7
               "res/images/UI/basicAttack.png", //0
               "res/images/UI/kick.png", //1
               "res/images/UI/chopWood.png", //2
               "res/images/UI/build.png", //3
               "res/images/UI/fireArrow.png", //4
               "res/images/UI/buildHouse.png", //4
               "res/images/UI/buildWoodenWall.png", //5
               "res/images/UI/craftWoodenArrow.png" //6
          ],
          [//generalUI, 8
               "res/images/UI/char.png", //0
               "res/images/UI/noimage.png",//1
               "res/images/UI/target.png",//2
               "res/images/UI/talents.png",//3
               "res/images/UI/questAccept.png",//4
               "res/images/UI/quests.png",//5
               "res/images/UI/spellBook.png",//6
               "res/images/UI/inventory.png"//7
          ],
          [//talents, 9
               "res/images/UI/talents/speed.png",
               "res/images/UI/talents/effect.png",
          ],
          [//npcs, 10
               "res/images/races/human/Jay.png",//0                                          
               "res/images/races/human/King.png",//1                                          
          ],
          [//general items, 11
               "res/images/items/general/healthPotion_1.png",//0
          ],          
     ];        

     self.RNP = 0;
     
     for (i = 0; i < self.sources.length; i++)
     {
          for (j = 0; j < self.sources[i].length; j++)
          {
               self.RNP ++;
          }
     }

     self.images = new Array();
     
     self.load = function(i, t)
     {
          if (self.sources[i][t] != undefined)
          {
               self.loading = self.sources[i][t];
               self.images[i][t] = new Image();
               self.images[i][t].onload = function()
               {
                    self.loaded ++;
                    t++; 
                    if(t >= self.sources[i].length)
                    {
                         return;
                    }
                    else
                    {
                         self.load(i, t);
                    }
               };
               
               self.images[i][t].src = self.sources[i][t];      
               self.nPics ++;
          }
     }

     self.i = 0;
     
     self.l = setInterval(function()
     {
          if (self.i < self.sources.length)
          {
               self.images.push([]);
               self.load(self.i, 0);
               self.i ++;
          }
          else
          {
               clearInterval(self.l);
          }
     }, 200);
     
     self.sliceHere = function(list, i)
     {
          buffOne = list.slice(0, i);
          buffTwo = list.slice(i + 1);
          
          return buffOne.concat(buffTwo);         
     }

     self.warnings = new Array();
     
     self.Warning = function(pos, time, font)
     {
          var w = this;
          w.pos = pos;
          w.warnings = new Array();
          w.time = time;
          w.font = font;
          
          w.deleteWarning = setInterval(function()
          {
               if (w.warnings.length > 0)
               {
                    w.warnings.shift();
               }
          }, w.time);
          
          w.warn = function(text, style)
          {
               w.warnings.push({"text": text, "style": style});
          }

          self.warnings.push(w);
     }
     
     self.generalWarning = new self.Warning([self.sx/2, 100], 5000, "15pt Arial");
     self.chat = new self.Warning([15, self.sy - 30], 15000, "12pt Arial");

     self.onClick = function(ev)
     {
          var x = (ev.clientX - self.canvas.offsetLeft);//*self.zoom;
          var y = (ev.clientY - self.canvas.offsetTop);//*self.zoom;
          
          self.mouse.x = x;
          self.mouse.y = y;
          
          send = true;
          
          for (q = 0; q < self.qs.length; q++)
          {
               if (self.notQuest && x > self.qs[q].rect[0]*self.zoom && x < (self.qs[q].rect[0] + self.qs[q].rect[2])*self.zoom && y > self.qs[q].rect[1]*self.zoom && y < (self.qs[q].rect[1] + self.qs[q].rect[3])*self.zoom)
               {
                    send = false;
                    self.notQuest = false;
                    input.quests = self.qs[q].id;
               }
          }
          
          for (ui = 0; ui < self.uis.uis.length; ui++)
               if (self.uis.uis[ui].elements != undefined)
               {
                    for (eel = 0; eel < self.uis.uis[ui].elements.length; eel++)
                    {
                         if (x > self.uis.uis[ui].bgrect[0] + self.uis.uis[ui].elements[eel].rect[0] && x < self.uis.uis[ui].bgrect[0] + self.uis.uis[ui].elements[eel].rect[2] + self.uis.uis[ui].elements[eel].rect[0] && y > self.uis.uis[ui].bgrect[1] + self.uis.uis[ui].elements[eel].rect[1] && y < self.uis.uis[ui].bgrect[1] + self.uis.uis[ui].elements[eel].rect[3] + self.uis.uis[ui].elements[eel].rect[1])
                         {
                              send = false;
                              self.uis.uis[ui].elements[eel].onclick();
                         }
                    }
               }

          if (self.uis.talents != false)
               for (ell = 0; ell < self.uis.talents.elements.length; ell++)
                    if (x > self.uis.talents.bgrect[0] + self.uis.talents.elements[ell].rect[0] && x < self.uis.talents.bgrect[0] + self.uis.talents.elements[ell].rect[0] + self.uis.talents.elements[ell].rect[2] && y > self.uis.talents.bgrect[1] + self.uis.talents.elements[ell].rect[1] && y < self.uis.talents.bgrect[1] + self.uis.talents.elements[ell].rect[1] + self.uis.talents.elements[ell].rect[3])
                    {
                         send = false;
                         self.uis.talents.elements[ell].onclick();
                         if (self.pl.points > 0)
                         {
                              self.pl.talents[ell]++;
                              self.pl.points--;
                         }
                    }


          if (self.uis.inventory != false)
               for (ell = 0; ell < self.uis.inventory.elements.length; ell++)
                    if (x > self.uis.inventory.bgrect[0] + self.uis.inventory.elements[ell].rect[0] && x < self.uis.inventory.bgrect[0] + self.uis.inventory.elements[ell].rect[0] + self.uis.inventory.elements[ell].rect[2] && y > self.uis.inventory.bgrect[1] + self.uis.inventory.elements[ell].rect[1] && y < self.uis.inventory.bgrect[1] + self.uis.inventory.elements[ell].rect[1] + self.uis.inventory.elements[ell].rect[3])
                    {
                         send = false;
                         input.options = "item";
                         input.item =  ell;
                    }    
          
          for (u = 0; u < self.uis.uis.length; u++)
               if (x > self.uis.uis[u].bgrect[0] && x < self.uis.uis[u].bgrect[0] + self.uis.uis[u].bgrect[2] && y > self.uis.uis[u].bgrect[1] && y < self.uis.uis[u].bgrect[1] + self.uis.uis[u].bgrect[3])
                    send = false;

          if (self.uis.talents != false)
               if (x > self.uis.talents.bgrect[0] && x < self.uis.talents.bgrect[0] + self.uis.talents.bgrect[2] && y > self.uis.talents.bgrect[1] && y < self.uis.talents.bgrect[1] + self.uis.talents.bgrect[3])
                    send = false;

          if(send)
          {
               self.notQuest = true;
               for (iu = 0; iu < self.uis.uis.length; iu++)
                    if (self.uis.uis[iu].tag == "quests")
                         self.uis.uis = self.sliceHere(self.uis.uis, iu);
               input.mouse = {"button": ev.which, "click": true, "x": x, "y": y};
          }
     }

     self.onContextMenu = function(ev)
     {
          var x = ev.clientX - self.canvas.offsetLeft;
          var y = ev.clientY - self.canvas.offsetTop;     
          input.mouse = {"button": ev.which, "click": true, "x": x, "y": y};
          ev.preventDefault();
     };

     self.mouseDown = function(ev)
     {
          if (ev.which == 1)
          {
               var x = ev.clientX - self.canvas.offsetLeft;
               var y = ev.clientY - self.canvas.offsetTop;

               self.start = "not";

               if (self.uis.spellBook != false)
                    for (s = 0; s < self.uis.spellBook.elements.length; s++)
                    {
                         rect = [self.uis.spellBook.bgrect[0] + self.uis.spellBook.elements[s].rect[0], self.uis.spellBook.bgrect[1] + self.uis.spellBook.elements[s].rect[1], 43, 43];
                         if (x > rect[0] && x < rect[0] + rect[2] && y > rect[1] && y < rect[1] + rect[3])
                         {
                              self.start = 
                              {
                                   n: "sb",
                                   b: s
                              };
                         }
                    }

               for (s = 0; s < self.pl.spells.length; s++)
               {
                    rect = [self.spells[0] + s*44 + 1, self.spells[1] + 1, 43, 43];
                    if (x > rect[0] && x < rect[0] + rect[2] && y > rect[1] && y < rect[1] + rect[3])
                    {
                         self.start = 
                         {
                              n: "s",
                              b: s
                         };
                         
                         if (s == 0)
                              input.one = true;
                         if (s == 1)
                              input.two = true;
                         if (s == 2)
                              input.three = true;
                         if (s == 3)
                              input.four = true;
                         if (s == 4)
                              input.five = true;
                    }
               }
          }
     }

     self.mouseUp = function(ev)
     {
          var x = ev.clientX - self.canvas.offsetLeft;
          var y = ev.clientY - self.canvas.offsetTop;

          if (ev.which == 1)
          {

               self.end = "not";

               input.one = false;
               input.two = false;
               input.three = false;
               input.four = false;
               input.five = false;

               for (s = 0; s < self.pl.spells.length; s++)
               {
                    rect = [self.spells[0] + s*44 + 1, self.spells[1] + 1, 43, 43];
                    if (x > rect[0] && x < rect[0] + rect[2] && y > rect[1] && y < rect[1] + rect[3])
                    {
                         self.end = 
                         {
                              n: "s",
                              b: s
                         };
                    }
               }

               if (self.uis.spellBook != false && self.pl.spellBook != undefined)
                    for (s = 0; s < self.pl.spellBook.length; s++)
                    {
                         rect = [self.uis.spellBook.bgrect[0] + s*44 + 1, self.uis.spellBook.bgrect[1] + 1, 43, 43];
                         if (x > rect[0] && x < rect[0] + rect[2] && y > rect[1] && y < rect[1] + rect[3])
                         {
                              self.end = 
                              {
                                   n: "sb",
                                   b: s
                              };
                         }
                    }

               if(self.start != "not" && self.end != "not")
               {
                    if (self.start.n == "s" && self.end.n == "s")
                    {
                         buffer = self.pl.spells.slice();

                         self.pl.spells[self.start.b] = buffer[self.end.b];
                         self.pl.spells[self.end.b] = buffer[self.start.b];           
                    }
                    else if (self.start.n == "s" && self.end.n == "sb")
                    {
                         buffer = self.pl.spells.slice();
                         buffer2 = self.pl.spellBook.slice();

                         self.pl.spells[self.start.b] = buffer2[self.end.b];           
                         self.pl.spellBook[self.end.b] = buffer[self.start.b];
                    } 
                    else if (self.start.n == "sb" && self.end.n == "s")
                    {
                         buffer = self.pl.spells.slice();
                         buffer2 = self.pl.spellBook.slice();

                         self.pl.spells[self.end.b] = buffer2[self.start.b];           
                         self.pl.spellBook[self.start.b] = buffer[self.end.b];
                    } 
                    else if (self.start.n == "sb" && self.end.n == "sb")
                    {
                         buffer2 = self.pl.spellBook.slice();

                         self.pl.spellBook[self.end.b] = buffer2[self.start.b];           
                         self.pl.spellBook[self.start.b] = buffer2[self.end.b];
                    } 
               }
               
               input.ui = {"s": self.pl.spells, "sb": self.pl.spellBook};
          }
          else if (ev.which == 3)
          {
               if (self.uis.inventory != false)
                    for (ell = 0; ell < self.uis.inventory.elements.length; ell++)
                         if (x > self.uis.inventory.bgrect[0] + self.uis.inventory.elements[ell].rect[0] && x < self.uis.inventory.bgrect[0] + self.uis.inventory.elements[ell].rect[0] + self.uis.inventory.elements[ell].rect[2] && y > self.uis.inventory.bgrect[1] + self.uis.inventory.elements[ell].rect[1] && y < self.uis.inventory.bgrect[1] + self.uis.inventory.elements[ell].rect[1] + self.uis.inventory.elements[ell].rect[3])
                         {
                              self.generalWarning.warn(self.pl.invD[ell], "rgb(10, 10, 10)");
                         }
          }
     }

	self.canvas.addEventListener("click", self.onClick, false);
     self.canvas.addEventListener("contextmenu", self.onContextMenu, false);
     self.canvas.addEventListener("mousedown", self.mouseDown, false);
     self.canvas.addEventListener("mouseup", self.mouseUp, false);

	self.update = function()
	{
          if(self.loaded < self.RNP)
          {
               self.screen.fillStyle = "rgb(205, 205, 190)";
               self.screen.fillRect(0, 0, self.sx, self.sy);
               
               self.screen.fillStyle = "rgb(0, 0, 0)";
               self.screen.font = "14pt Arial";
               self.screen.textBaseline = "top";
               
               self.screen.fillText("Loaded: " + self.loaded + "/" + self.RNP + ".", self.sx/2, self.sy/2);
               self.screen.fillText(self.loading, self.sx/2, self.sy/2 + 50);
          }
          else
          {
		     self.draw();
          }
     }

     self.checkInput = function()
     {
          if (input.plus)
          {
               self.zoom -= self.zoom*0.1;
          }
          if (input.minus)
          {
               self.zoom += self.zoom*0.1;
          }

          if (self.pl.chat.chat && !(input.enter))
          {
               did = true;
          }

          if (input.enter && self.pl.chat.chat == false)
          {
               self.pl.chat.lastEner = new Date().getTime();
               self.pl.chat.chat = true;
               input.chat = true;
          }
          else if (did && input.enter && self.pl.chat.chat == true)
          {
               did = false;
               self.pl.chat.lastEner = new Date().getTime();
               self.pl.chat.chat = false;
               self.pl.chat.send = true;
               input.chat = undefined;
          }
          
          if (input.chat)
               self.pl.chat.scan();
               
          if (input.right)
          {
               self.pl.rect[0] += (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;
               self.pl.w.rect[0] += (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;
          }
          
          if (input.left)
          {
               self.pl.rect[0] -= (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;
               self.pl.w.rect[0] -= (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;

          }
          
          if (input.up)
          {
               self.pl.rect[1] -= (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;
               self.pl.w.rect[1] -= (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;
          }
          
          if (input.down)
          {
               self.pl.rect[1] += (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;
               self.pl.w.rect[1] += (self.pl.speed.val * (1 + self.pl.tl.speed/(self.pl.tl.speed + 1)) * (new Date().getTime() - self.pl.speed.lastCheck))/25;
          }
               
          self.pl.speed.lastCheck = new Date().getTime();
     }

	self.showStats = function()
	{
	     statWindow = window.open("", "", "width = 150, height = 300, location = no");
	     statWindow.document.write("<p> Woodcutting: " + self.pl.skills.woodCutting + "</p>");
	     statWindow.document.write("<p> Building: " + self.pl.skills.building + "</p>");
	     statWindow.focus();
	}
	
     drawPlayer = function()
     {
		if (self.defined)
		{
		     self.screen.drawImage(self.images[self.pl.img[0]][self.pl.img[1]], self.sx/2, self.sy/2, self.pl.rect[2]*self.zoom, self.pl.rect[3]*self.zoom);// self.images[self.pl.img[0]][self.pl.img[1]].width*self.zoom, self.images[self.pl.img[0]][self.pl.img[1]].heigth*self.zoom);
               self.screen.fillStyle = "rgba(200, 10, 10, 0.5)";
               self.screen.fillRect((self.sx/2 + (self.images[self.pl.img[0]][self.pl.img[1]].width - (self.pl.health.current / self.pl.health["max"])*100) / 2)*self.zoom, (self.sy/2 - 15)*self.zoom, (self.pl.health.current / self.pl.health["max"]*100)*self.zoom, 5*self.zoom);                                                                                                                          
		}
		
		if (self.pl.w != undefined)
		{
		     self.screen.drawImage(self.images[self.pl.w.img[0]][self.pl.w.img[1]], (self.pl.w.rect[0] + self.sx/2 - self.pl.rect[0]), (self.pl.w.rect[1] + self.sy/2 - self.pl.rect[1]));
		}

		if (self.pl.a != undefined)
		{
		     pos = [self.sx/2, self.sy/2];
               pos[1] += 8;
               pos[0] -= self.pl.rect[2]/2 + 2;
		     self.screen.drawImage(self.images[self.pl.a.img[0]][self.pl.a.img[1]], pos[0], pos[1]);
		}
     }
     
     self.drawUI = function()
     {
          for (ad = 0; ad < self.pl.ads.length; ad++)
          {
               self.pl.ads[ad][0][0] = self.pl.ads[ad][0][0] + "";
               self.screen.fillStyle = "rgba" + self.pl.ads[ad][0][2] + "" + self.pl.ads[ad][0][3] + ")";//"rgb(250, 0, 0)";//"rgb(" + self.pl.ads[ad][0][0]/self.pl.ads[ad][0][2] * 255 + 50 + "10" + ")";
               self.screen.font = "14pt Arial";
               self.screen.textBaseline = "top";
               
               if (self.pl.ads[ad][0][0].indexOf(".") != -1)
                    self.screen.fillText(self.pl.ads[ad][0][0].slice(0, self.pl.ads[ad][0][0].indexOf(".")), self.pl.ads[ad][0][1][0] + self.pl.ads[ad][0][1][2]/2 - (self.pl.ads[ad][0][0] + "").length/2 - self.pl.rect[0] + self.sx/2, self.pl.ads[ad][0][1][1] - 20 - self.pl.rect[1] + self.sy/2);
               else
                    self.screen.fillText(self.pl.ads[ad][0][0], self.pl.ads[ad][0][1][0] + self.pl.ads[ad][0][1][2]/2 - (self.pl.ads[ad][0][0] + "").length/2 - self.pl.rect[0] + self.sx/2, self.pl.ads[ad][0][1][1] - 20 - self.pl.rect[1] + self.sy/2);
          }

          if (self.pl.target != false && self.pl.target != undefined)
          {
               self.uis.uis.push({"bgrect": [self.sx - 150 - 50, 5, 150, 90], "elements": [{"toDraw": {"img": [8, 2]}, "rect": [0, 0, 150, 90]}, {"toDraw": {"img": [8, 1]}, "rect": [3, 3, 42, 55]}, {"toDraw": {"img": false}, "rect": [55, 65, "health", 10], "refob": self.pl.target}]})
          }

          for (u = 0; u < self.uis.uis.length; u++)
          {
               self.screen.fillStyle = "rgba(250, 250, 250, 0.4)";
               self.screen.fillRect(self.uis.uis[u].bgrect[0], self.uis.uis[u].bgrect[1], self.uis.uis[u].bgrect[2], self.uis.uis[u].bgrect[3]);
               if (!(self.uis.uis[u].spells) && self.uis.uis[u].elements != undefined)
               {
                    for (el = 0; el < self.uis.uis[u].elements.length; el++)
                    {
                         if (self.uis.uis[u].elements[el].toDraw.img == undefined || self.uis.uis[u].elements[el].toDraw.img == false)
                         {
                              if (self.uis.uis[u].elements[el].rect[2] == "health")
                              {
                                   self.screen.fillStyle = "rgba(200, 10, 10, 0.6)";
                                   self.screen.fillRect(self.uis.uis[u].bgrect[0] + self.uis.uis[u].elements[el].rect[0], self.uis.uis[u].bgrect[1] + self.uis.uis[u].elements[el].rect[1], self.uis.uis[u].elements[el].refob.health.current/self.uis.uis[u].elements[el].refob.health["max"]*100, self.uis.uis[u].elements[el].rect[3]);
                              }
                              else if (self.uis.uis[u].elements[el].rect[2] == "exp")
                              {
                                   self.screen.fillStyle = "rgba(105, 10, 105, 0.6)";
                                   self.screen.fillRect(self.uis.uis[u].bgrect[0] + self.uis.uis[u].elements[el].rect[0], self.uis.uis[u].bgrect[1] + self.uis.uis[u].elements[el].rect[1], self.uis.uis[u].elements[el].refob.level.xpCurrent/self.uis.uis[u].elements[el].refob.level.xpMax*100, self.uis.uis[u].elements[el].rect[3]);
                              }
                              else if (self.uis.uis[u].elements[el].rect[2] == "text")
                              {
                                   self.screen.fillStyle = "rgb(10, 10, 10)";
                                   self.screen.textBaseline = "top";
                                   self.screen.font = "14pt Arial";
                                   self.screen.fillText(self.uis.uis[u].elements[el].toDraw.text, self.uis.uis[u].elements[el].rect[0] + self.uis.uis[u].bgrect[0], self.uis.uis[u].elements[el].rect[1] + self.uis.uis[u].bgrect[1]);                    	
                              }
                              else
                              {
                                   self.screen.fillStyle = self.uis.uis[u].elements[el].toDraw.style;
                                   self.screen.fillRect(self.uis.uis[u].bgrect[0] + self.uis.uis[u].elements[el].rect[0], self.uis.uis[u].bgrect[1] + self.uis.uis[u].elements[el].rect[1], self.uis.uis[u].elements[el].rect[2], self.uis.uis[u].elements[el].rect[3]);
                              }
                         }
                         else
                         {
                              self.screen.drawImage(self.images[self.uis.uis[u].elements[el].toDraw.img[0]][self.uis.uis[u].elements[el].toDraw.img[1]], self.uis.uis[u].bgrect[0] + self.uis.uis[u].elements[el].rect[0], self.uis.uis[u].bgrect[1] + self.uis.uis[u].elements[el].rect[1], self.uis.uis[u].elements[el].rect[2], self.uis.uis[u].elements[el].rect[3]);
                         }
                    }
               }
          }
          
          for (s = 0; s < self.pl.spells.length; s++)
          {
               self.screen.drawImage(self.images[7][self.pl.spells[s]], self.spells[0] + s*44 + 1, self.spells[1] + 1);
               self.screen.fillStyle = "rgba(200, 200, 50, 0.1)";

               if (input.four && s == 3)
               {
                    self.screen.fillRect(self.spells[0] + s*44 + 1, self.spells[1] + 1, 43, 43);
               }
               if (input.one && s == 0)
               {
                    self.screen.fillRect(self.spells[0] + s*44 + 1, self.spells[1] + 1, 43, 43);
               }
               if (input.two && s == 1)
               {
                    self.screen.fillRect(self.spells[0] + s*44 + 1, self.spells[1] + 1, 43, 43);
               }
               if (input.three && s == 2)
               {
                    self.screen.fillRect(self.spells[0] + s*44 + 1, self.spells[1] + 1, 43, 43);
               }
               if (input.five && s == 4)
               {
                    self.screen.fillRect(self.spells[0] + s*44 + 1, self.spells[1] + 1, 43, 43);
               }
          
          }

          if (self.uis.talents != false && self.pl.talents != undefined)
          {
               self.screen.fillStyle = "rgba(250, 250, 250, 0.4)";
               self.screen.fillRect(self.uis.talents.bgrect[0], self.uis.talents.bgrect[1], self.uis.talents.bgrect[2], self.uis.talents.bgrect[3]);
               for (eel = 0; eel < self.uis.talents.elements.length; eel++)
               {
                    self.screen.drawImage(self.images[self.uis.talents.elements[eel].toDraw.img[0]][self.uis.talents.elements[eel].toDraw.img[1]], self.uis.talents.elements[eel].rect[0] + self.uis.talents.bgrect[0], self.uis.talents.elements[eel].rect[1] + self.uis.talents.bgrect[1]);
                    self.screen.fillStyle = "rgb(200, 200, 10)";
                    self.screen.textBaseline = "top";
                    self.screen.font = "14pt Arial";
                    self.screen.fillText(self.pl.talents[eel], self.uis.talents.elements[eel].rect[0] + self.uis.talents.bgrect[0] + self.uis.talents.elements[eel].rect[2]/2, self.uis.talents.elements[eel].rect[1] + self.uis.talents.bgrect[1] + self.uis.talents.elements[eel].rect[3]/2);                    	
               }
          }

          if (self.uis.spellBook != false && self.pl.spellBook != undefined)
          {
               self.screen.fillStyle = "rgba(250, 250, 250, 0.4)";
               self.screen.fillRect(self.uis.spellBook.bgrect[0], self.uis.spellBook.bgrect[1], self.uis.spellBook.bgrect[2], self.uis.spellBook.bgrect[3]);
               for (eel = 0; eel < self.uis.spellBook.elements.length; eel++)
               {
                    self.screen.drawImage(self.images[self.uis.spellBook.elements[eel].toDraw.img[0]][self.uis.spellBook.elements[eel].toDraw.img[1]], self.uis.spellBook.elements[eel].rect[0] + self.uis.spellBook.bgrect[0], self.uis.spellBook.elements[eel].rect[1] + self.uis.spellBook.bgrect[1]);
               }
          }
          if (self.uis.inventory != false && self.pl.inventory != undefined)
          {
               self.screen.fillStyle = "rgba(250, 250, 250, 0.4)";
               self.screen.fillRect(self.uis.inventory.bgrect[0], self.uis.inventory.bgrect[1], self.uis.inventory.bgrect[2], self.uis.inventory.bgrect[3]);
               for (eel = 0; eel < self.uis.inventory.elements.length; eel++)
               {
                    self.screen.drawImage(self.images[self.uis.inventory.elements[eel].toDraw.img[0]][self.uis.inventory.elements[eel].toDraw.img[1]], self.uis.inventory.elements[eel].rect[0] + self.uis.inventory.bgrect[0], self.uis.inventory.elements[eel].rect[1] + self.uis.inventory.bgrect[1]);
               }
          }

          if (self.uis.quests != false && self.uis.quests != undefined)
          {
               self.screen.fillStyle = "rgba(250, 250, 250, 0.4)";
               self.screen.fillRect(self.uis.quests.bgrect[0], self.uis.quests.bgrect[1], self.uis.quests.bgrect[2], self.uis.quests.bgrect[3]);
               for (eel = 0; eel < self.uis.quests.elements.length; eel++)
               {
                    self.screen.fillStyle = "rgb(10, 10, 10)";
                    self.screen.textBaseline = "top";
                    self.screen.font = "14pt Arial";
                    self.screen.fillText(self.uis.quests.elements[eel].toDraw.text, self.uis.quests.elements[eel].rect[0] + self.uis.quests.bgrect[0], self.uis.quests.elements[eel].rect[1] + self.uis.quests.bgrect[1]);                    	
               }
          }

          offset = 0;

          for (w = 0; w < self.warnings.length; w++)
               for (wa = 0; wa < self.warnings[w].warnings.length; wa++)
               {
                    self.screen.fillStyle = self.warnings[w].warnings[wa].style;
                    self.screen.textBaseline = "top";
                    self.screen.font = self.warnings[w].font;
                    self.screen.fillText(self.warnings[w].warnings[wa].text, self.warnings[w].pos[0] - (self.warnings[w].warnings[wa].text.length)/2, self.warnings[w].pos[1] + 15*offset - self.warnings[w].warnings.length*15);           
                    offset++;
               }         	
     
          if(self.pl.chat.chat)
          {
               self.screen.fillStyle = "rgb(250, 250, 250)";
               self.screen.font = "14pt Arial";
               self.screen.textBaseline = "top";
               self.screen.fillText("SAY: " + self.pl.chat.Log, 10, self.sy - 25);
          }
          
          if (self.pl.target != false && self.pl.target != undefined)
          {
               self.uis.uis.pop();
          }
     }

     self.target = function(rect)
     {
          return [(self.pl.target.rect[0] - self.pl.rect[0] + self.sx/2 - 5)*self.zoom, ((self.pl.target.rect[1] - self.pl.rect[1] + self.sy/2) + (self.pl.target.rect[3] - self.pl.target.rect[2]) + self.pl.target.rect[2]/2)*self.zoom, (self.pl.target.rect[2] + 10)*self.zoom, self.pl.target.rect[2]*self.zoom];
     }

	self.draw = function()
	{
	     //if (self.loaded == self.nPics)
	     //{
          pos = [Math.round(self.pl.rect[0]), Math.round(self.pl.rect[1])];
          self.info.innerHTML = ("<p>" + "<b style=color:Green;> Health: </b>" + self.pl.health.current + "<b style=color:Blue;> - Level: </b>" + self.pl.level.level + "(" + self.pl.level.xpCurrent + "/" + self.pl.level.xpMax + ")" + "<b style=color:SaddleBrown;> - Wood: </b>" + Math.round(self.pl.resources.wood) + "<b style=color:Tan;> - Stone: </b>" + Math.round(self.pl.resources.stone) + "<b style=color:DimGrey;> - Iron: </b>" + Math.round(self.pl.resources.iron) + "<b> - Position: </b>" + pos + "<p>");
          self.screen.fillStyle = "rgb(0, 140, 0)";
          self.screen.fillRect(0, 0, self.sx, self.sy);

          if (self.pl.target != undefined && self.pl.target != false)
          {
               self.screen.fillStyle = "rgba(150, 10, 100, 0.5)"; //targetsquare
               var tr = self.target(self.pl.target.rect);
               self.screen.fillRect(tr[0], tr[1], tr[2], tr[3]); 
          }     

          noCol = true;
          self.pl.drawn = false;
          self.qs = new Array();
     
		for (i = 0; i < self.pl.seeing.length; i++)
		{                   
		     if (self.pl.drawn != true)
		     {
		          if (self.sy/2 + self.pl.rect[3] > self.sy/2 + self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.pl.seeing[i].rect[3]) //(sy/2 + self.pl.rect[3] > self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2 + self.pl.seeing[i].rect[3] - self.pl.seeing[i].rect[3])
		          {
		               self.screen.drawImage(self.images[self.pl.seeing[i].img[0]][self.pl.seeing[i].img[1]], (self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2)*self.zoom - self.offset, (self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2)*self.zoom - self.offset);
                         
                         no = true;
                         for (ii = 0; ii < self.dontDisplay.length; ii++)
                         {
                              if (self.pl.seeing[i].id == self.dontDisplay[ii])
                              {
                                   no = false;
                              }
                         }
                         
                         if (self.pl.seeing[i].quest && no)
                         {
                              self.screen.drawImage(self.images[6][2], (self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2 + self.pl.seeing[i].rect[2]/2 - self.images[6][2].width/2)*self.zoom - self.offset, (self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2 - self.images[6][2].height - 5)*self.zoom - self.offset);
                              self.qs.push({"rect": [self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2 + self.pl.seeing[i].rect[2]/2 - self.images[6][2].width/2, self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2 - self.images[6][2].height - 5, self.images[6][2].width, self.images[6][2].height], "id": self.pl.seeing[i].id});
                         }
		               drawPlayer();
		               self.pl.drawn = true;
		          }
		          else
		          {
		               drawPlayer();
		               self.pl.drawn = true;
		               self.screen.drawImage(self.images[self.pl.seeing[i].img[0]][self.pl.seeing[i].img[1]], (self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2)*self.zoom - self.offset, (self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2)*self.zoom - self.offset);
                         no = true;
                         for (ii = 0; ii < self.dontDisplay.length; ii++)
                         {
                              if (self.pl.seeing[i].id == self.dontDisplay[ii])
                              {
                                   no = false;
                              }
                         }

                         if (self.pl.seeing[i].quest && no)
                         {
                              self.screen.drawImage(self.images[6][2], (self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2 + self.pl.seeing[i].rect[2]/2 - self.images[6][2].width/2)*self.zoom - self.offset, (self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2 - self.images[6][2].height - 5)*self.zoom - self.offset);
                              self.qs.push({"rect": [self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2 + self.pl.seeing[i].rect[2]/2 - self.images[6][2].width/2, self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2 - self.images[6][2].height - 5, self.images[6][2].width, self.images[6][2].height], "id": self.pl.seeing[i].id});
                         }
		          }
	               noCol = false;
               }
               else
               {
	               self.screen.drawImage(self.images[self.pl.seeing[i].img[0]][self.pl.seeing[i].img[1]], (self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2)*self.zoom - self.offset, (self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2)*self.zoom - self.offset);
                    no = true;
                    for (ii = 0; ii < self.dontDisplay.length; ii++)
                    {
                         if (self.pl.seeing[i].id == self.dontDisplay[ii])
                         {
                              no = false;
                         }
                    }
               
                    if (self.pl.seeing[i].quest && no)
                    {
                         self.screen.drawImage(self.images[6][2], (self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2 + self.pl.seeing[i].rect[2]/2 - self.images[6][2].width/2)*self.zoom - self.offset, (self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2 - self.images[6][2].height - 5)*self.zoom - self.offset);
                         self.qs.push({"rect": [self.pl.seeing[i].rect[0] - self.pl.rect[0] + self.sx/2 + self.pl.seeing[i].rect[2]/2 - self.images[6][2].width/2, self.pl.seeing[i].rect[1] - self.pl.rect[1] + self.sy/2 - self.images[6][2].height - 5, self.images[6][2].width, self.images[6][2].height], "id": self.pl.seeing[i].id});
                    }
               }
		}                   

          if (self.pl.target != undefined && self.pl.target != false)
          {
               self.screen.fillStyle = "rgba(200, 10, 10, 0.5)"; //healthbar
               self.screen.fillRect(self.pl.target.rect[0] - self.pl.rect[0] + self.sx/2 - self.pl.target.health.current / self.pl.target.health["max"] * 100/2 + self.pl.target.rect[2]/2, self.pl.target.rect[1] - 15 - self.pl.rect[1] + self.sy/2, self.pl.target.health.current / self.pl.target.health["max"] * 100, 5);                                                                                                                          
          }

          if (noCol)
          {
               drawPlayer();
          }

          if (self.pl.sound != undefined && self.pl.sound != false)
		{
		     //playSound(self.pl.sound);
		}
		
		time = self.pl.hours - (12 + 3); //(12 + x), a u x je najjace sunce
		mins = self.pl.mins;

		if (time <= 0)
		{
		     time = time*(-1);
		     mins = mins*(-1);
		}

          light = (time + mins/60)/24;		

          self.screen.fillStyle = "rgba(0, 0, 0, " + light + ")";
          self.screen.fillRect(0, 0, self.sx, self.sy);

		self.drawUI();
     }
     //}         
                    
     self.isInArray = function(el, arr)
     {
          is = false
          il = 0
          for (i1 = 0; i1 < arr.length; i1++)
          {
               if (arr[i1] == el)
               {
                    is = true
                    il = i1
               }
          }
          return [is, il]
     }
     self.pars = function(data)
     { 
          if (data.self != undefined)
          {
               if (data.self.ads != undefined)
                    self.pl.ads.push(data.self.ads);

               self.pl.seeing = data.self.seeing;
                   
               self.pl.seeing = self.pl.seeing.concat(self.pl.world);
               
               self.pl.seeing.sort(function(a, b){return (a.rect[1] + a.rect[3] - b.rect[3]) - b.rect[1];});          
               self.pl.level = data.self.level;
               self.pl.health = data.self.health;
               self.pl.rect = data.self.rect;
               self.pl.speed = data.self.speed;
               self.pl.resources = data.self.resources;
               self.pl.skills = data.self.skills;
               self.pl.target = data.self.target;
               self.pl.w = data.self.w;
               self.pl.a = data.self.a;
               self.pl.hours = data.self.hours;
               self.pl.mins = data.self.mins;
               self.pl.sound = data.self.sound;
               
               if (data.self.options != undefined)
               {
                    if (data.self.options.n == "talents")
                    {
                         self.pl.talents = [data.self.talents.attack, data.self.talents.speed, data.self.talents.effect];
                         self.pl.points = data.self.talents.points;
                         self.pl.tl = data.self.talents;
                    }
                    else if (data.self.options.n == "spellBook")
                    {
                         self.pl.spellBook = data.self.spellBook;
                         self.sbOffset = 0;
                         self.sbOffset2 = 0;
                         
                         if (self.pl.spellBook != undefined && self.pl.spellBook != false && self.uis.spellBook != false)
                              for (ss = 0; ss < self.pl.spellBook.length; ss++)
                              {
                                   self.uis.spellBook.elements[ss] = {"rect": [1 + self.sbOffset2, 2 + parseInt(self.sbOffset/285)*43, 43, 43], "toDraw": {"img": [7, self.pl.spellBook[ss]]}, "onclick": function(){console.log("clickOnSpellBookSpell")}}; 
                                   self.sbOffset += 43;
                                   self.sbOffset2 = self.sbOffset - parseInt(self.sbOffset/285)*285;
                                   if (self.sbOffset2 > 285)
                                        self.sbOffset2 = 0;
                              } 
                    }
                    else if (data.self.options.n == "inventory")
                    {
                         self.pl.inventory = data.self.inventory;
                         self.pl.invImg = data.self.invImg;
                         self.pl.invD = data.self.invD;
                         self.invOffset = 0;
                         self.invOffset2 = 0;
                         
                         if (self.pl.inventory != undefined && self.pl.inventory != false && self.uis.inventory != false)
                              self.uis.inventory.elements = new Array();
                              for (ss = 0; ss < self.pl.inventory.length; ss++)
                              {
                                   self.uis.inventory.elements[ss] = {"rect": [1 + self.invOffset2, 1 + parseInt(self.invOffset/285)*45, 43, 43], "toDraw": {"img": self.pl.invImg[ss]}, "onclick": function(){console.log("clickOnInventory")}}; 
                                   self.invOffset += self.images[self.pl.invImg[ss][0]][self.pl.invImg[ss][1]].width;
                                   self.invOffset2 = self.invOffset - parseInt(self.invOffset/285)*285;
                                   if (self.invOffset2 > 285)
                                        self.invOffset2 = 0;
                              }
                    }
                    else if (data.self.options.n == "quests")
                    {
	                    self.uis.uis.push(
	                    {
	                         "bgrect": [self.sx/2 - 150, 10, 300, 375], 
	                         "elements":
	                         [
	                              {"rect": [300/2 - self.images[8][4].width/2, 375 - self.images[8][4].height - 5, self.images[8][4].width, self.images[8][4].height], "refob": self.pl, "toDraw":{"img": [8, 4]}, "onclick": function(){input.quests = "accept"}},
	                              {"rect": [0, 0, "text", "text"], "toDraw": {"text": data.self.options.quest.description}}
	                         ], 
	                         "tag": "quests"
	                    });
                    }
                    
                    if (data.self.options.n == "acceptedQuest")
                    {
                         self.pl.quests.push(data.self.options.quest);
                         for (iu = 0; iu < self.uis.uis.length; iu++)
                         {
                              if (self.uis.uis[iu].tag == "quests")
                              {
                                   self.uis.uis = self.sliceHere(self.uis.uis, iu);
                                   self.dontDisplay.push(data.self.options.id);
                                   self.generalWarning.warn("Accepted quest '" + data.self.options.quest.n + "'!", "rgb(10, 200, 100)");
                              }
                         }
                    }
                    
                    if (data.self.options.n == "completedQuest")
                    {
                         for (d = 0; d < self.dontDisplay.length; d++)
                         {
                              for (qq = 0; qq < self.pl.seeing.length; qq++)
                              {
                                   if (self.pl.seeing[qq].id == self.dontDisplay)
                                   {
                                        self.dontDisplay = self.sliceHere(self.dontDisplay, d);
                                   }
                              }
                         }
                         self.pl.quests = data.self.options.quests;
                         self.generalWarning.warn("Completed quest '" + data.self.options.donewith +"'!", "rgb(200, 200, 50)");
                    }
               }
          }
     }
     
     self.Player = function(n, pli)
     {
          var p = this;
          p.n = n;
          p.level = pli.level;
          p.health = pli.health;
          p.ads = new Array();

          setInterval(function()
          {
               if (p.ads.length > 0)
               {
                    p.ads.shift();
               }
          }, 2000);
          
          setInterval(function()
          {
               for (add = 0; add < p.ads.length; add++)
               {
                    p.ads[add][0][1][1]--;
                    p.ads[add][0][3] -= 0.11;
               }
          }, 100);
          
          p.rect = pli.rect;
          p.speed = pli.speed;
          p.resources = pli.resources;
          p.target = pli.target;
          p.quests = pli.quests;
          p.rect = pli.rect;
          p.spells = pli.spells;
          p.spellBook = pli.spellBook;
          p.allS = p.spells.concat(p.spellBook);
          p.options = pli.options;
          p.img = [3, 0];
          p.inventory = pli.inventory;
          //p.seeing = new Array();
          p.tl = pli.talents;
          
          p.scan = function()
          {
               if (input.code != undefined)
               {
                    switch (input.code)
                    {
                         case 68: p.chat.Log = p.chat.Log + "d"; break;
                    }
                    
                    input.code = undefined;
               }
          }
          
          p.chat = 
          {
               "chat": false,
               "Log": p.n + " said: ",
               "scan": p.scan,
               "send": false,
               "lastEnter": 0
          }
          self.generalWarning.warn("Welcome, " + p.n + "!", "rgb(0,0,0)");
     }

     self.socket.on("init", function (data)
     {
          self.pl = new self.Player(nm, data.pli);
          self.defined = true;
          self.pl.world = data.world.slice();
          self.uis = 
          {
               "uis": new Array(),
               "talents": false
          };          

		self.spells = [(self.sx - (self.pl.spells.length * 44 + 1))/2, self.sy - 50, self.pl.spells.length * 44 + 1, 45];

          talents = function()
          {
               input.options = "talents";
               if (self.uis.talents != false)
               {
                    self.uis.talents = false;
               }
               else
               {
                    self.uis.talents = 
                    {
                         "bgrect": [self.sx/2 - 150, self.sy/2 - 200, 300, 400],
                         "elements": 
                         [
                              {"rect": [1, 1, 43, 43], "toDraw": {"img": [7, 0]}, "onclick": function(){input.options = "attack";}}, 
                              {"rect": [1 + 43 + 1, 1, 43, 43], "toDraw": {"img": [9, 0]}, "onclick": function(){input.options = "speed";}},
                              {"rect": [1 + 43 + 1 + 43 + 1, 1, 43, 43], "toDraw": {"img": [9, 1]}, "onclick": function(){input.options = "effect";}}
                         ]
                    };    
               }
          }
          
          self.uis.spellBook = false;
          
          spellBook = function()
          {
               input.options = "spellBook";
               if (self.uis.spellBook != false)
               {
                    self.uis.spellBook = false;
               }
               else
               {
                    self.uis.spellBook = 
                    {
                         "bgrect": [self.sx/2 - 150, self.sy/2 - 200, 300, 400],
                         "elements": 
                         [
                         ]
                    };    
               }
          }

          self.uis.inventory = false;

          inventory = function()
          {
               if (self.uis.inventory != false)
               {
                    self.uis.inventory = false;
               }
               else
               {
                    input.options = "inventory";
                    self.uis.inventory = 
                    {
                         "bgrect": [self.sx/2 - 150, self.sy/2 - 200, 300, 400],
                         "elements": 
                         [
                         ]
                    };    
               }
          }
               
          quests = function()
          {
               if (self.uis.quests != false)
               {
                    self.uis.quests = false;
               }
               else
               {
                    offset = 0;
                    self.uis.quests = 
                    {

                         "bgrect": [self.sx/2 - 150, self.sy/2 - 200, 300, 400],
                         "elements": new Array()
                    };
                    for (qqs = 0; qqs < self.pl.quests.length; qqs++)
                    {
                         self.uis.quests.elements.push({"rect": [5, 5 + offset, "text", "text"], "toDraw":{"text": self.pl.quests[qqs].description}});
                         offset += 11;
                    }
               }
          }

		self.uis.uis.push({"bgrect": self.spells, "spells": true});
		self.uis.uis.push(
		{
		     "bgrect": [5, 5, 150, 90], 
		     "elements":
		     [
		          {"rect":[50, 65, "health", 12], "refob": self.pl, "toDraw":{"img": false}},
		          {"refob": self.pl, "toDraw":{"img": false}, "rect":[50, 77, "exp", 12]}, 
		          {"refob": self.pl, "rect": [0, 0, 150, 90], "toDraw": {"img": [8, 0], "style": false}, "onclick": function(){console.log("click on char.")}}
		     ]
	     });
	     
          self.uis.uis.push(
          {
               "bgrect": [self.spells[0] + self.spells[2] + 50, self.sy - 50, self.pl.options.length*44 + 1, 45], 
               "elements": 
               [
                    {"toDraw": {"img": [8, 3]}, "rect":[1, 1, 43, 43], "refob": self.pl, "onclick": talents},
                    {"toDraw": {"img": [8, 5]}, "rect":[45, 1, 43, 43], "refob": self.pl, "onclick": quests},
                    {"toDraw": {"img": [8, 6]}, "rect": [89, 1, 43, 43], "refob": self.pl, "onclick": spellBook},
                    {"toDraw": {"img": [8, 7]}, "rect": [133, 1, 43, 43], "refob": self.pl, "onclick": inventory},
               ]
          });

          self.socket.emit("update", {"pressed": input});
     });
          
     self.socket.on("update", function (data)
     {
          self.pars(data);
          input.zoom = self.zoom;
          
          if (self.mouse.x != self.mouseBuffer.x && self.mouse.y != self.mouseBuffer.y)
	     {
               self.mouseBuffer.x = self.mouse.x;
               self.mouseBuffer.y = self.mouse.y;
               input.mousePos = self.mouse;
          }
          else
          {
               input.mousePos = undefined;
          }
          
          if (self.pl.chat.send)
          {
               self.socket.emit("chat", {"chat": self.pl.chat.Log});
               self.pl.chat.send = false;
               self.pl.chat.Log = self.pl.n + " said: ";
	     }

          self.socket.emit("update", {"pressed": input});
	     
	     input.mouse = {"click": false};
	     input.ui = undefined;
          input.options = undefined;
          input.quests = undefined;
     });
     
     self.socket.on("chat", function(data)
     {
          self.chat.warn(data.msg, "rgb(0, 0, 0)");    
     });
     
     self.socket.on("newStatic", function(data)
     {
          self.pl.world.push(data);
     });

     self.socket.on("delStatic", function(data)
     {
          for(b = 0; b < self.pl.world.length; b++)
               if (self.pl.world[b].id == data.id)
               {
                    self.pl.world = self.sliceHere(self.pl.world, b);
               }
     });

     self.socket.on("changeStatic", function(data)
     {
          for(b = 0; b < self.pl.world.length; b++)
               if (self.pl.world[b].id == data.id)
               {
                    self.pl.world[b] = data;
               }
     });
}

