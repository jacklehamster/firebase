package  {
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.net.URLRequestHeader;
	import flash.media.Camera;
	import flash.utils.getTimer;
	import flash.net.URLLoader;
	import flash.text.TextField;
	
	public class Firebase extends MovieClip {

		private var firebaseURL:String = "https://dynamic-image.firebaseio.com/images/545409d4b845/3589611a8d65/18c7a840/src.json";
		
		private var cam:Camera;
		private var video:Video;
		private var bitmapData:BitmapData = new BitmapData(320,240,false,0);
		private var encoder:JPEGEncoderOptions = new JPEGEncoderOptions();
		private var request:URLRequest = new URLRequest();
		private var lastRequest:int = 0;
		private var PERIOD:int = 50;

		
		function Firebase() {
			
			if(!loaderInfo.parameters.firebaseLocation) {
				var tf:TextField = new TextField();
				tf.text = "Missing 'firebaseLocation' parameter in FlashVars.\nEx:"+
					"firebaseLocation=https://dynamic-image.firebaseio.com/images/545409d4b845/3589611a8d65/18c7a840/src.json";
				return;
			}
			firebaseURL = loaderInfo.parameters.firebaseLocation;
			PERIOD = loaderInfo.parameters.fps ? Math.round(1000/loaderInfo.parameters.fps) : 50;
			
			request.method = URLRequestMethod.POST;
			request.url = firebaseURL+"?x-http-method-override=PUT";

			cam = Camera.getCamera();
			cam.setMode(320,240,20);
			video = new Video();
			video.attachCamera(cam);			
			cam.addEventListener(Event.VIDEO_FRAME,onVideoFrame);

			addChild(video);

		}
		
		function onVideoFrame(e:Event):void {
			var now:int = getTimer();
			if(now-lastRequest>PERIOD) {
				lastRequest = now;
				cam.drawToBitmapData(bitmapData);
				var bytes:ByteArray = bitmapData.encode(bitmapData.rect,encoder);
				dataURI = "data:image/jpeg;base64,"+ Base64.encode(bytes) + ";" + (now%10000);
				var urlloader:URLLoader = new URLLoader();
				request.data = "\""+dataURI+"\"";
				urlloader.load(request);
			}
		}
	}
	
}
