worker.onmessage = (e) => {
	if (msg.type === "ready") {
		worker.postMessage({
			type: 'run',
			MEMFS: [{ name: 'input.webm', data }],
			arguments: ['-i', 'input.webm', '-ss', '00:00:10', '-t', '0:00:02', '-c', 'copy', 'output.webm']
		})
	}
}