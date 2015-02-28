package  {
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.net.URLRequestHeader;
	import flash.media.Camera;
	import flash.utils.getTimer;
	import flash.net.URLLoader;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	
	public class Firebase extends MovieClip {

		static private const WIDTH:int = 320, HEIGHT:int = 240, FPS:int = 24;
		private var firebaseURL:String = "https://dynamic-image.firebaseio.com/images/545409d4b845/3589611a8d65/18c7a840/src.json";
		
		private var cam:Camera;
		private var video:Video;
		private var bitmapData:BitmapData = new BitmapData(WIDTH,HEIGHT,false,0);
		private var encoder:JPEGEncoderOptions = new JPEGEncoderOptions();
		private var request:URLRequest = new URLRequest();
		private var lastRequest:int = 0;
		private var PERIOD:int = Math.round(1000/FPS);

		
		function Firebase() {
			
			if(!loaderInfo.parameters.firebaseLocation) {
				var tf:TextField = new TextField();
				tf.text = "Missing 'firebaseLocation' parameter in FlashVars.";
				tf.width = stage.stageWidth;
				tf.autoSize = TextFieldAutoSize.LEFT;
				addChild(tf);
				return;
				//firebaseURL = "https://dynamic-image.firebaseio.com/images/545409d4b845/3589611a8d65/18c7a840/src.json";
			}
			else {
				firebaseURL = loaderInfo.parameters.firebaseLocation;
			}
			if(loaderInfo.parameters.fps)
				PERIOD = Math.round(1000/loaderInfo.parameters.fps);
			
			request.method = URLRequestMethod.POST;
			request.url = firebaseURL+"?x-http-method-override=PUT";

			cam = Camera.getCamera();
			cam.setMode(WIDTH,HEIGHT,1000/PERIOD);
			video = new Video();
			video.attachCamera(cam);			
			cam.addEventListener(Event.VIDEO_FRAME,onVideoFrame);

			addChild(video);
			video.width = stage.stageWidth;
			video.height = stage.stageHeight;
		}
		
		function onVideoFrame(e:Event):void {
			var now:int = getTimer();
			if(now-lastRequest>PERIOD) {
				lastRequest = now;
				cam.drawToBitmapData(bitmapData);
				var bytes:ByteArray = bitmapData.encode(bitmapData.rect,encoder);
				var timestamp:int = now;
				dataURI = "data:image/jpeg;base64,"+ Base64.encode(bytes) + ";" + (timestamp%100000);
				var urlloader:URLLoader = new URLLoader();
				request.data = "\""+dataURI+"\"";
				urlloader.load(request);
			}
		}
	}
	
}
