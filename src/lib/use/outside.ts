interface Params {
  className: string;
  onClick?: () => void;
}

export default function outside(node: HTMLElement, params: Params) {
  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement

    if (!node.contains(target) && !target.closest(params.className)) {
      if (params.onClick) {
        params.onClick();
      }
    }
  }

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}
