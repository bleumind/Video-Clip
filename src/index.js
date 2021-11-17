let stream = null,
	audio = null,
	mixedStream = null,
	chunks = [], 
	recorder = null,
	startButton = null,
	stopButton = null,
	cutButton = null, 
	downloadButton = null,
	recordedVideo = null, 
	start = null, 
	end = null, 
	startSecond = null,
	startMinute = null,
	endSecond = null,
	endMinute = null;

let prevStartSecond = 0,
	prevStartMinute = 0,
	prevEndSecond = 0,
	prevEndMinute = 0;

	const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');

	const ffmpeg = createFFmpeg({ 
		log: true });

	(async () => {
		await ffmpeg.load();
	})();
	
	async function setupStream () {
		try {
			stream = await navigator.mediaDevices.getDisplayMedia({
				video: true
			});
			
			audio = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 44100,
				},
			});
			
			setupVideoFeedback();
		} catch (err) {
			console.error(err)
		}
	}
	
	function setupVideoFeedback() {
		if (stream) {
			const video = document.querySelector('.video-feedback');
			video.srcObject = stream;
			video.play();
		} else {
			console.warn('No stream available');
		}
	}
	
	async function startRecording () {
		await setupStream();
		
		if (stream && audio) {
			mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
			recorder = new MediaRecorder(mixedStream);
			recorder.ondataavailable = handleDataAvailable;
			recorder.onstop = handleStop;
			recorder.start(1000);
			start = Date.now();
			startButton.disabled = true;
			stopButton.disabled = false;
			
			console.log('Recording started');
		} else {
			console.warn('No stream available.');
		}
	}
	
	function stopRecording () {
		recorder.stop();
		
		startButton.disabled = false;
		stopButton.disabled = true;
	}
	
	function handleDataAvailable (e) {
		chunks.push(e.data);
	}
	
	async function trim() {

		if(ffmpeg.isLoaded()){
			ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(recordedVideo.src));
			await ffmpeg.run('-i', 'video.mp4', '-ss', `${(startMinute.value * 60) + startSecond.value}`, '-to', `${(endMinute.value * 60) + endSecond.value}`, 'output.mp4');
			message.innerHTML = 'Complete trimming';
			const data = ffmpeg.FS('readFile', 'output.mp4');

			recordedVideo.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

			downloadButton.href = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
			downloadButton.download = 'video.mp4';
			downloadButton.disabled = false;
		}
		else { 
			console.error('wait until ffmpeg is loaded');
		}
      };


	function handleStop (e) {
		// chunks.splice(1, chunks.length-10);
		
		end = (Date.now() - start) / 1000; // to Seconds
		console.log(end);
		const options = {mimeType: 'video/mp4'};
		const blob = new Blob(chunks, options);
		chunks = [];
		startSecond.value = 0;
		startMinute.value = 0;
		endSecond.value = end % 60;
		let i = 0;
		while(end > 60){
			end -= 60;
			i++;
		};
		endMinute.value = i;

		downloadButton.href = URL.createObjectURL(blob);
		downloadButton.download = 'video.mp4';
		downloadButton.disabled = false;
		recordedVideo.src = URL.createObjectURL(blob);
		recordedVideo.load();
		recordedVideo.onloadeddata = function() {
		const rc = document.querySelector(".recorded-video-wrap");
		rc.classList.remove("hidden");
		rc.scrollIntoView({ behavior: "smooth", block: "start" });

		recordedVideo.play();
		}

		stream.getTracks().forEach((track) => track.stop());
		audio.getTracks().forEach((track) => track.stop());

		console.log('Recording stopped');
}


window.addEventListener('load', () => {
	startButton = document.querySelector('.start-recording');
	stopButton = document.querySelector('.stop-recording');
	downloadButton = document.querySelector('.download-video');
	recordedVideo = document.querySelector('.recorded-video');
	cutButton = document.querySelector('.cut-video');

	startSecond = document.querySelector("#Start .Seconds");
	startMinute = document.querySelector("#Start .Minutes");
	endSecond = document.querySelector("#End .Seconds");
	endMinute = document.querySelector("#End .Minutes");

	startSecond.addEventListener('change', () => {
		if((startMinute.value * 60) + startSecond.value <= end){
			prevStartSecond = startSecond.value;
		}
		else { 
			startSecond.value = prevStartSecond
		};
	});

	startMinute.addEventListener('change', () => {
		if((startMinute.value * 60) + startSecond.value <= end){
			prevStartMinute = startMinute.value;
		}
		else { 
			startMinute.value = prevStartMinute
		};
	});

	endSecond.addEventListener('change', () => {
		if((endMinute.value * 60) + endSecond.value <= end){
			prevEndSecond = endSecond.value;
		}
		else { 
			endSecond.value = prevEndSecond
		};
	});

	endMinute.addEventListener('change', () => {
		if((endMinute.value * 60) + endSecond.value <= end){
			prevEndMinute = endMinute.value;
		}
		else { 
			endMinute.value = prevEndMinute;
		};
	});

	cutButton.addEventListener('click', trim)
	startButton.addEventListener('click', startRecording);
	stopButton.addEventListener('click', stopRecording);
})
