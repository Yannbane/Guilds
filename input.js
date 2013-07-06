var KEY = { SH:16, H: 72, D: 68, W: 87, A: 65, S:83, Q:81, E:69, RIGHT:39, UP:38, LEFT:37, DOWN:40, BACK: 8, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, MIN: 187, PLUS: 189, ENTER: 13};

var input = {
	right: false,
	up: false,
	left: false,
	down: false,
	quit: false,
	one: false,
	two: false,
	three: false,
	four: false,
	five: false,
	six: false,
	seven: false,
	eight: false,
	mouse: {"click": false},
	minus: false,
	plus: false,
	health: false,
	enter: false,
	code: undefined,
	broke: false,
	sh: false
};

function press(evt) {
	var code = evt.keyCode;

     if (code == 8 && window.game.pl != undefined)
          evt.preventDefault();
     else
	     switch(code) 
	     {
		     case KEY.W: input.up = true; break;
		     case KEY.A: input.left = true; break;
		     case KEY.S: input.down = true; break;
		     case KEY.D: input.right = true; break;

		     case KEY.Q: input.q = true; break;
		     case KEY.E: input.e = true; break;
		     case KEY.H: input.health = true; break;

		     case KEY.ONE: input.one = true; break;
		     case KEY.TWO: input.two = true; break;
		     case KEY.THREE: input.three = true; break;
               case KEY.FOUR: input.four = true; break;
               case KEY.FIVE: input.five = true; break;
               case KEY.SIX: input.six = true; break;
               case KEY.SEVEN: input.seven = true; break;
               case KEY.EIGHT: input.eight = true; break;

               case KEY.SH: input.sh = true; break;

               //case KEY.BACK: event.preventDefault(); break;

               //case KEY.MIN: input.minus = true; break;
               //case KEY.PLUS: input.plus = true; break;
               case KEY.ENTER: input.enter = true; break;               
                    
               //default: console.log(code);
	     }
}

function release(evt)
{
	var code = evt.keyCode;
     input.code = code;
	
     switch(code) 
     {
		case KEY.W: input.up = false; break;
		case KEY.A: input.left = false; break;
		case KEY.S: input.down = false; break;
		case KEY.D: input.right = false; break;
		
		case KEY.Q: input.q = false; break;
		case KEY.E: input.e = false; break;		
		case KEY.H: input.health = false; break;

		case KEY.ONE: input.one = false; break;
		case KEY.TWO: input.two = false; break;
		case KEY.THREE: input.three = false; break;
		case KEY.FOUR: input.four = false; break;
		case KEY.FIVE: input.five = false; break;
		case KEY.SIX: input.six = false; break;
		case KEY.SEVEN: input.seven = false; break;
		case KEY.EIGHT: input.eight = false; break;

          case KEY.SH: input.sh = false; break;

          //case KEY.MIN: input.minus = false; break;
          //case KEY.PLUS: input.plus = false; break;
          case KEY.ENTER: input.enter = false; input.broke = true; input.brokes = true; break;               
	}
}

