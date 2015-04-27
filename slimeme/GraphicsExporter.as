package  {
	
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.display.GraphicsPath;
	import flash.display.IGraphicsData;
	import flash.display.GraphicsPathCommand;
	import flash.display.GraphicsStroke;
	import flash.display.IGraphicsFill;
	import flash.display.GraphicsSolidFill;
	import flash.display.GraphicsEndFill;
	import flash.display.FrameLabel;
	
	
	public class GraphicsExporter extends MovieClip {
		
		private var frames:Array = [], stroking:Boolean=false,filling:Boolean=false;
		
		public function GraphicsExporter() {
//			trace(getChildAt(0),getChildAt(1).mask);
			//for(var i:int=0;i<totalFrames;i++) {
			//	gotoAndPlay(1+i);
			//}
			//stop();
			addEventListener(Event.FRAME_CONSTRUCTED,analyze);
		}
		
		private function processAll():Array {
			var list:Array = [];
			var datas:Vector.<IGraphicsData> = graphics.readGraphicsData(true);
			for each(var data:IGraphicsData in datas) {
				processGraphicsData(data,list);
			}
			return list;
		}
		
		private function processGraphicsData(g:IGraphicsData,list:Array):void {
				if(g is GraphicsPath) {
					processPath(g as GraphicsPath,list);
				}
				else if(g is GraphicsStroke) {
					if(processStroke(g as GraphicsStroke,list)) {
						stroking = true;
					}
				}
				else if(g is GraphicsEndFill) {
					if(stroking)
						list.push(["stroke"]);
					if(filling)
						list.push(["fill"]);
					stroking = filling = false;
				}
				else if(g is GraphicsSolidFill) {
					processFill(g as GraphicsSolidFill,list);
					filling = true;
				}
				else {
					trace(g);
				}
		}
		
		private function processStroke(stroke:GraphicsStroke,list:Array):Boolean {
			if(!stroke.thickness) {
				return false;
			}
			list.push(["set","lineWidth",stroke.thickness]);
			var fill:GraphicsSolidFill = stroke.fill as GraphicsSolidFill;
			if(fill) {
				list.push(["set","strokeStyle","#"+(fill.color+parseInt("1000000",16)).toString(16).substr(1)]);
			}
			return true;
		}
		
		private function processFill(fill:GraphicsSolidFill,list:Array):void {
			list.push(["set","fillStyle","#"+(fill.color+parseInt("1000000",16)).toString(16).substr(1)]);
		}
		
		private function processPath(g:GraphicsPath,list:Array):void {
			var commands:Vector.<int> = g.commands.reverse();
			var data:Vector.<Number> = g.data.reverse();
			var x:Number,y:Number,cx:Number,cy:Number;
			while(commands.length) {
				var command:int = commands.pop();
				switch(command) {
					case GraphicsPathCommand.MOVE_TO:
						x = data.pop();
						y = data.pop();
						list.push(["moveTo",x,y]);
						break;
					case GraphicsPathCommand.LINE_TO:
						x = data.pop();
						y = data.pop();
						list.push(["lineTo",x,y]);
						break;
					case GraphicsPathCommand.CURVE_TO:
						x = data.pop();
						y = data.pop();
						cx = data.pop();
						cy = data.pop();
						list.push(["quadraticCurveTo",x,y,cx,cy]);
						break;
				}
			}
		}
		
		private function analyze(e:Event):void {
			frames[currentFrame] = {
				
			};
			frames[currentFrame].commands = processAll();

			if(currentFrame==totalFrames) {
				e.currentTarget.removeEventListener(e.type,arguments.callee);

				for each(var label:FrameLabel in currentLabels) {
					frames[label.frame].label = label.name;
				}
				
				
				
				trace(JSON.stringify(frames));
				//stop();
			}
		}
		
		public function setState(property:String,value:Boolean):void {
			frames[currentFrame][property] = value;
		}
	}
	
}
