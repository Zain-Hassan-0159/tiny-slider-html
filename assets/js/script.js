window.addEventListener('load', function () {
  const draggableIcon = document.getElementById('draggable-icon');
  const slider = document.querySelector('.draggable-wrapper');
  const labels = document.querySelectorAll('.label');
  const numLabels = labels.length;

  let maxLeft;
  let snapPositions = [];
  let iconPercentPosition = 0;

  const carousel = tns({
    container: '.boldism_slider',
    items: 1,
    slideBy: 'page',
    autoplay: false,
    controls: false,
    nav: false,
    speed: 400,
    loop: false,
    mouseDrag: true,
  });

  function recalculatePositions() {
    maxLeft = slider.offsetWidth - draggableIcon.offsetWidth;
    snapPositions = [];

    for (let i = 0; i < numLabels; i++) {
      const snapPosition = (i / (numLabels - 1)) * maxLeft;
      snapPositions.push(snapPosition);
    }
  }

  recalculatePositions();

  function updateIconPositionFromPercentage() {
    const newLeft = iconPercentPosition * maxLeft;
    draggableIcon.style.left = `${newLeft}px`;
  }

  function onDrag(e, isTouch = false) {
    let left;

    if (isTouch) {
      left = e.touches[0].pageX - slider.offsetLeft - draggableIcon.offsetWidth / 2;
    } else {
      left = e.pageX - slider.offsetLeft - draggableIcon.offsetWidth / 2;
    }

    if (left < 0) left = 0;
    if (left > maxLeft) left = maxLeft;

    draggableIcon.style.left = left + 'px';
    iconPercentPosition = left / maxLeft;
  }

  function onDrop() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onDrop);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onDrop);

    const currentLeft = parseFloat(draggableIcon.style.left);

    const nearestPosition = snapPositions.reduce((prev, curr) => {
      return Math.abs(curr - currentLeft) < Math.abs(prev - currentLeft) ? curr : prev;
    });

    draggableIcon.style.left = nearestPosition + 'px';
    iconPercentPosition = nearestPosition / maxLeft;

    const slideIndex = snapPositions.indexOf(nearestPosition);
    carousel.goTo(slideIndex);  // Move carousel to the slide corresponding to the nearest snap point
  }

  function onMouseMove(e) {
    onDrag(e, false);
  }

  draggableIcon.addEventListener('mousedown', function (e) {
    e.preventDefault();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onDrop);
  });

  function onTouchMove(e) {
    onDrag(e, true);
  }

  draggableIcon.addEventListener('touchstart', function (e) {
    e.preventDefault();
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onDrop);
  });

  labels.forEach((label, index) => {
    label.addEventListener('click', function () {
      const newPosition = snapPositions[index];
      draggableIcon.style.left = newPosition + 'px';
      iconPercentPosition = newPosition / maxLeft;
      carousel.goTo(index);
    });
  });

  window.addEventListener('resize', function () {
    recalculatePositions();
    updateIconPositionFromPercentage();
  });

  carousel.events.on('indexChanged', function (info) {
    const currentIndex = info.index;
    const newPosition = snapPositions[currentIndex];
    draggableIcon.style.left = newPosition + 'px';
    iconPercentPosition = newPosition / maxLeft;
  });

  // Handle clicks directly on the slider line
  slider.addEventListener('click', function (e) {
    const clickPosition = e.pageX - slider.offsetLeft;

    // Find the nearest snap position to the click
    const nearestPosition = snapPositions.reduce((prev, curr) => {
      return Math.abs(curr - clickPosition) < Math.abs(prev - clickPosition) ? curr : prev;
    });

    // Move the draggable icon to the nearest position
    draggableIcon.style.left = nearestPosition + 'px';

    // Update percentage based on the snap
    iconPercentPosition = nearestPosition / maxLeft;

    // Move the carousel to the corresponding slide
    const slideIndex = snapPositions.indexOf(nearestPosition);
    carousel.goTo(slideIndex);
  });
});
