package  {
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.net.URLRequestHeader;
	
	public class Firebase extends MovieClip {

		private var firebaseURL:String = "https://dynamic-image.firebaseio.com/images/545409d4b845/3589611a8d65/18c7a840/src.json";
		
		private var cam:Camera;
		private var video:Video;
		private var bitmapData:BitmapData = new BitmapData(320,240,false,0);
		private var encoder:JPEGEncoderOptions = new JPEGEncoderOptions();
		private var urlloader:URLLoader;
		private var request:URLRequest = new URLRequest();

		
		function Firebase() {
			request.method = URLRequestMethod.POST;
			request.url = firebaseURL;
			request.requestHeaders = [new URLRequestHeader("X-HTTP-Method-Override", "PUT")];

			cam = Camera.getCamera();
			video = new Video();
			video.attachCamera(cam);			
			cam.addEventListener(Event.VIDEO_FRAME,onVideoFrame);

			addChild(video);

		}
		
		function onVideoFrame(e:Event):void {
			if(!urlloader) {
				bitmapData.draw(video);
				var bytes:ByteArray = bitmapData.encode(bitmapData.rect,encoder);
				dataURI = "data:image/jpeg;base64,"+ Base64.encode(bytes);
				urlloader = new URLLoader();
				urlloader.addEventListener(Event.COMPLETE,
					function(e:Event):void {
						urlloader = null;
					});
				request.data = "\""+dataURI+"\"";
				urlloader.load(request);
			}
		}
	}
	
}
