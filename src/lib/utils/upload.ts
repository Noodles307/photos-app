
interface UploadEvents {
  done?: () => void;
  error?: (err?: unknown) => void;
  progress?: (_: number) => void;
}

export const uploadFile = (file: File, restrictionID: string, path: string, events?: UploadEvents) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `/upload/${restrictionID}?path=${path}`, true)
  xhr.withCredentials = true
  xhr.onload = function() {
    if (xhr.status === 200) {
      if (events?.done) events.done()
    } else {
      if (events?.error) events.error()
    }
  }
  xhr.onerror = function() {
    if (events?.error) events.error()
  }
  xhr.upload.onprogress = function(event) {
    if (events?.progress) events.progress(event.loaded / event.total)
  }

  const formData = new FormData()
  formData.append("file", file)
  xhr.send(formData);

  return () => xhr.abort()
}
