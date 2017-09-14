(function (D) {
  'use strict';
  function $(selector) {
    return D.querySelector(selector);
  }

  // Initial property values will be reflected in UI at startup.
  var state = {
    on: false,
    bpm: 80,
    beats: 2,
    accent: true,
    timeLimit: {
      active: true,
      minutes: 1,
      seconds: 0,
      toMilliseconds: function () {
        return this.toSeconds() * 1000;
      },
      toSeconds: function () {
        return this.minutes * 60 + this.seconds;
      },
      introBar: true
    }
  };

  var $start = $('#start-button');
  var $stop = $('#stop-button');
  var $bpmSlider = $('#bpm-slider');
  var $bpmNum = $('#bpm-num');
  var $beats = $('#beats-num');
  var $timeLimitActive = $('#time-limit-active');
  var $timeLimitMinutes = $('#time-limit-minutes');
  var $timeLimitSeconds = $('#time-limit-seconds');
  var $timeLimitIntroBar = $('#time-limit-intro-bar');
  var $timerProgress = $('#timer-progress');

  var $audioBeat = $('#audio-beat');
  var $audioAccent = $('#audio-accent');

  var beatTimer;
  var beatCount = 0;
  var startTime;

  function has(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }

  function updateUIFromState() {
    D.body.classList.toggle('on', state.on);
    $bpmSlider.value = state.bpm;
    $bpmNum.value = state.bpm;
    $beats.value = state.beats;
    $timeLimitActive.checked = state.timeLimit.active;
    $timeLimitMinutes.value = state.timeLimit.minutes;
    $timeLimitSeconds.value = state.timeLimit.seconds;
    $timeLimitIntroBar.checked = state.timeLimit.introBar;
    $timerProgress.max = state.timeLimit.toSeconds();

    $('#debug').innerHTML = JSON.stringify(state, null, 2);
  }

  function getInterval(bpm) {
    return (60 / bpm) * 1000;
  }

  function playBeat() {
    var timeNow = (new Date()).getTime();

    if (beatCount === 0 && state.accent && state.beats > 1) {
      $audioAccent.play();
    } else {
      $audioBeat.play();
    }

    if (beatCount < state.beats - 1) {
      beatCount += 1;
    } else {
      beatCount = 0;
    }

    if (state.timeLimit.active && timeNow - startTime > state.timeLimit.toMilliseconds()) {
      setState({ on: false });
    }
  }

  function updateTimerProgress() {
    var progress = Math.round(((new Date()).getTime() - startTime) / 1000);
    $timerProgress.value = progress;
  }

  function setState(newState) {
    clearInterval(beatTimer);
    // Slight offset to avoid single extra beat.
    startTime = (new Date()).getTime() - 10;
    if (state.timeLimit.introBar) {
      startTime += getInterval(state.bpm) * state.beats;
    }
    beatCount = 0;

    ['on', 'bpm', 'beats'].forEach(function (property) {
      if (has(newState, property)) {
        state[property] = newState[property];
      }
    });

    if (has(newState, 'timeLimit') && typeof newState.timeLimit === 'object') {
      ['active', 'minutes', 'seconds', 'introBar'].forEach(function (property) {
        if (has(newState.timeLimit, property)) {
          state.timeLimit[property] = newState.timeLimit[property];
        }
      });
    }

    if (state.on) {
      beatTimer = setInterval(function () {
        playBeat();
        if (state.timeLimit.active) {
          updateTimerProgress();
        }
      }, getInterval(state.bpm, state.beats));
    }

    updateUIFromState();
  }

  function handleUIChange(event) {
    var input = event.target;
    var prop = input.getAttribute('data-prop');
    var splitProp = prop.split('.');
    var newState = {};
    var value = input.type === 'checkbox' ?
      input.checked : parseInt(input.value);

    if (splitProp.length === 1) {
      newState[prop] = value;
    } else {
      newState[splitProp[0]] = {};
      newState[splitProp[0]][splitProp[1]] = value;
    }

    setState(newState);
  }

  D.addEventListener('input', handleUIChange);
  D.addEventListener('change', handleUIChange);
  $start.addEventListener('click', function () {
    setState({ on: true });
  });
  $stop.addEventListener('click', function () {
    setState({ on: false });
  });

  updateUIFromState();
}(window.document));
