import { Readable } from "stream";

// converts web stream to node
export function readStreamToReadable(readStream: ReadableStream) {
  const result = new Readable({ read() { } });
  const reader = readStream.getReader();
  function push() {
    reader.read()
      .catch((err) => {
        result.destroy(err);
      })
      .then((pck) => {
        if (!pck) {
          return;
        }
        if (pck.done) {
          return result.push(null);
        }
        result.push(pck.value);
        push();
      });
  }
  push();
  return result;
}

// converts node stream to web
export function readableToReadStream(
  readable: Readable
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      readable.addListener("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      readable.addListener("end", () => {
        controller.close();
      });
      readable.addListener("error", (err) => {
        controller.error(err);
      });
    },
  });
}
