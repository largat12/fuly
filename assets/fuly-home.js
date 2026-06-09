/* FULY Home — testimonials carousel arrows.
   The marquee animation is pure CSS (see fuly-home.css). */
document.addEventListener('DOMContentLoaded', function () {
  var tracks = document.querySelectorAll('[data-fuly-testimonials-track]');

  tracks.forEach(function (track) {
    var section = track.closest('[data-fuly-testimonials-section]') || track.parentElement;
    if (!section) return;

    var prev = section.querySelector('[data-fuly-testimonials-prev]');
    var next = section.querySelector('[data-fuly-testimonials-next]');

    function getStep() {
      var card = track.querySelector('.fuly-testimonial-card');
      if (!card) return 300;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || '16') || 16;
      return card.getBoundingClientRect().width + gap;
    }

    if (prev) {
      prev.addEventListener('click', function () {
        track.scrollBy({ left: -getStep(), behavior: 'smooth' });
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        track.scrollBy({ left: getStep(), behavior: 'smooth' });
      });
    }
  });
});
