interface Parameters {
  open?: () => void;
  select?: () => void;
}

const LONG_PRESS_DURATION = 300;

export default function interact(node: HTMLElement, parameters?: Parameters) {
	let startInteractionTimestamp = 0
	let cancelTimeoutHandle: ReturnType<typeof setTimeout>

	function innerInteract() {
		clearTimeout(cancelTimeoutHandle)

		if (startInteractionTimestamp === 0) {
			return
		}

		if (Date.now() - startInteractionTimestamp >= LONG_PRESS_DURATION) {
      if (parameters?.select) {
        parameters.select();
      }
		} else {
      if (parameters?.open) {
        parameters.open();
      }
		}

		startInteractionTimestamp = 0
	}

	function pointerDown(e: PointerEvent) {
    if (e.button !== 0) {
      return;
    }
		e.preventDefault()
    e.stopPropagation()

		startInteractionTimestamp = Date.now()
		cancelTimeoutHandle = setTimeout(innerInteract, LONG_PRESS_DURATION)
	}

	function pointerUp(e: PointerEvent) {
    if (e.button !== 0) {
      return;
    }

    e.stopPropagation()
		e.preventDefault()
		innerInteract()
	}

	function pointerLeave(e: PointerEvent) {
    if (e.button !== 0) {
      return;
    }
    e.stopPropagation()
		e.preventDefault()
		clearTimeout(cancelTimeoutHandle)
		startInteractionTimestamp = 0
	}

	node.addEventListener('pointerup', pointerUp)
	node.addEventListener('pointerdown', pointerDown)
	node.addEventListener('pointerleave', pointerLeave)

	return {
		destroy() {
			node.removeEventListener('pointerup', pointerUp)
			node.removeEventListener('pointerdown', pointerDown)
			node.removeEventListener('pointerleave', pointerLeave)
		}
	}
}
