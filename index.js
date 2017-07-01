/** 
 * Application entry point
 *
 * @function main
 * @todo - Add bootstrap 
 * @todo - Add JSDoc
 */
function main() {
  console.clear();

  // create and init slider
  const store = initVue({ manager: new MySlideManager(), answers: answers, data: data });
  SoundEffect.init(PubSub);

  // start presentation
  store.state[MANAGER].start();
}

/**
 * @constant
 * @type {object}
 * @default
 */
const types = {
  ANSWER: 'answer',
  CORRECT: 'correct',
  WRONG: 'wrong',
  MANAGER: 'manager',
}
const { ANSWER, CORRECT, WRONG, MANAGER } = types;

/**
 * answers state controller
 * @constant
 * @type {string}
 */
const answers = Object.create({
  /**
   * Update answers internal state
   * @param {object} payload
   * @param {boolean} payload.correct - true if answer is correct
   * @param {boolean} payload.bonus - true if bonus question
   */
  update: function update({ correct, bonus}) {
    switch(true) {
      case !correct: this[WRONG]++; 
        break;
      case bonus: this[CORRECT]++;  // intentional fallthrough
      case correct: this[CORRECT]++;
    }
  }
});

/** @method */
answers.update = answers.update.bind(answers);
answers[CORRECT] = 0;
answers[WRONG] = 0;

/**
 * 
 * @function createStore
 * @param {object} config - configuration options
 * @return {object} store
 */
function createStore(config) {
  var { manager, answers, data: { slides } } = config;
  const store = new Vuex.Store({
    strict: true,
    state: {
      slides,
      [MANAGER]: manager,
      [ANSWER]: answers,
    },
    mutations: {
      [ANSWER](state, payload) {
        state[ANSWER].update(payload);
      },
      [MANAGER](state, payload) {
        state[MANAGER].update(payload);
      }
    },
  });
  
  // delegate manager state handling to the store 
  manager.$on('set', (type, payload) => store.commit(MANAGER, payload));
  
  // Notify the global PubSub whenever the store mutates.
  store.subscribe((mutation, state) => PubSub.publish(mutation.type, mutation.payload))
  
  return store;
}

class Events {
  constructor() {
    this.pubsub = Object.create(PubSub);
  }
  
  // emit events
  $emit(...args){
    this.pubsub.publish(...args);
  }
  
  // subscribe to events
  $on(...args) {
    this.pubsub.subscribe(...args);
  }
  
}

/**
 * Class representing a slide manager.
 * @extends Events
 */
class SlideManager extends Events {
  
  /** 
   * Initialize instance with options.
   * @emits SlideManager#init
   * @param {object} options - configuration options
   * @return {number} number of slides
   */
  init(options={}) {
    // configuration
    Object.assign(this, this.defaults, options);

    // subscribe event handlers (i.e 'oninit' handles 'init' event)
    for (let prop in this) {
      var fn = this[prop];
      if (prop.startsWith('on') && typeof fn == 'function') {
        this.$on(prop.substr('on'.length), fn);
      }
    }
    
    this.$emit('init');
    
    return this;
  }
  
  /** 
   * Get number of slides in slider
   * @return {number} number of slides
   */
  get length() {
    return this.slides.length;
  }
  
  /** 
   * Check if instance has no items
   * @return {boolean} true if empty, false otherwise
   */
  get empty() {
    return this.length === 0;
  }
  
  /**
   * Start the presentation
   *
   * @emits SlideManager#start
   * @param {number} current - the index to start with  
   */
  start(current=0) {
    if (this.empty) {
      return this;
    }
    if (current >= 0 && current < this.length) {
      this.set('current', current);
      this.$emit('start');
    }
    
    return this;
  }

  /**
   * change current index
   *
   * @emits SlideManager#move
   * @param index {number} - the index to change to
   * @return {object} this
   */
  move(index) {
    if (this.isMoveAllowed(index)) {
      index = index % this.length;
      var oldIndex = this.current;
      this.set('current', index);
      this.$emit('move', {index, oldIndex});      
    }
    return this;
  }

  /**
   * Check if move is valid
   * @param index - The index to move to
   * @return {boolean} result
   */
  isMoveAllowed(index) {
    return (!this.empty && index !== this.current && index >= 0 && index < this.length);
  }
  
  /**
   * Set instance state and emit change event
   *
   * @emits SlideManager#change
   * @param {string} prop - the property name
   * @param value = the new value of the property
   */
  set(prop, value) {
    this[prop] = value;
    this.$emit('change', { prop, value });
  }
}

// default values
SlideManager.prototype.defaults = {
  slides: [],
  current: -1,
  oninit: null,
  onstart: null,
  onmove: null,
}


/**
 * Class representing a customized slide manager.
 * @extends SlideManager
 */
class MySlideManager extends SlideManager {
  
  /**
  * Create MySlideManager
  */
  constructor() {
    super();
    var slider = this;

    slider.init({
      slides: data.slides,
      onmove: function onmove(event) {
        // disable show all when moving to another slide
        slider.set('isShowAll', false);
      },
    });
  }
  
  /**
   * Move to next slide.
   */
  next() {
    return this.move(this.current + 1);
  }
  
  /**
   * Move to previous slide.
   */
  prev() {
    return this.move(this.current - 1);
  }
  
  /**
   * Toggle showing all slides or change back to current slide
   * @emits MySlideManager#showall
   */
  showAll() {
    this.toggle('isShowAll');
    this.$emit('showall');
  }
  
  /**
   * Show score
   * @emits MySlideManager#showresults
   */
  showResults() {
    this.toggle('isShowResults');
    this.$emit('showresults');
  }
  
  
  /**
   * Toggle a boolean property value
   * @prop The property to toggle
   */
  toggle(prop) {
    this.set(prop, !this[prop]);
  }
  
  /**
   * Trigger a set event. the subscriber is responsible for changing the state
   *
   * @emits MySlideManager#showresults
   * @prop The property to set
   * @value The new value
   */
  set(prop, value) {
    this.$emit('set', { prop, value });
  }
  
  /**
   * update internal state. meant to be used with an external controller
   * which listens to the MySlideManager#set event
   * @param {object} payload
   * @param {string} prop - property name to update
   * @param {*} value - new value for property
   */
  update({prop, value}) {
    super.set(prop, value);
  }
} 
// manager default options
MySlideManager.prototype.defaults = Object.assign(
  {},
  SlideManager.prototype.defaults, 
  {
    isShowAll: false,
    isShowResults: false,
  }
);

// bind methods
boundClass(SlideManager);
boundClass(MySlideManager);

// Vue js
function initVue({manager, answers, data}){
  
  // inject a handler for translate function
  Vue.mixin({
    methods: {
      t: translate
    }
  });
  
  const store = createStore({manager, answers, data});
  
  // slide component
  Vue.component('x-slide', {
    template: '#x-slide',
    props: ['title', 'questions'],
  });
  
  // slide header component
  Vue.component('x-slide-header', {
    template: '#x-slide-header',
    props: ['title'],
  });
  
  // slide body
  Vue.component('x-slide-body', {
    template: '#x-slide-body',
    props: ['questions'],
  });
  
  // question component
  Vue.component('x-slide-question', {
    template: '#x-slide-question',
    props: ['text', 'answers', 'bonus', 'source'],
    data: function() { 
      return {
        handled: false,
        answerCount: 0,
        revealAnswer: false
      }; 
    },
    methods: {
      answered(correct) {
        if (correct) {
          this.handle();
        }
        this.answerCount += 1;
        this.$store.commit(ANSWER, {correct: correct, bonus: this.bonus});
      },
      handle() {
        // flag question as handled
        this.handled = true;
      },
    },
    watch: {
      answerCount(currentCount, oldCount) {
        // mark answer as handled when all but the correct answer were clicked
        if (!this.handled && currentCount === this.answers.length-1) {
          this.handle();
          this.revealAnswer = true;
        }
      }
    }
  });
  
  // answer component
  Vue.component('x-slide-answer', {
    template: '#x-slide-answer',
    props: ['text', 'correct', 'handled', 'revealed'],
    data: function() { 
      return { 
        clicked: false,
      }; 
    },
    methods: {
      clickHandler() {
        if (!this.handled) {
          this.clicked = true;
        }
      },
    },
    watch: {
      clicked(val, oldVal) {
        // notify parent component an answer was clicked
        this.$emit(ANSWER, {correct: this.correct});
      }
    }
  });
  
  // bonus question component
  Vue.component('x-slide-bonus', {
    template: '#x-slide-bonus',
  });
  
  // slide source link
  Vue.component('x-slide-source', {
    template: '#x-slide-source',
    props: ['source']
  });
  
  // Slider
  var App = new Vue({
    el: '#vue-slider',
    template: '#x-slider',
    store: store,
    computed: Vuex.mapState({
      slides: 'slides',
      manager: MANAGER
    }),
    methods: {
      show(index) {
        // show slide at specific index
        return this.manager.isShowAll || index === this.manager.current;
      }
    }
  });    
  
  // Total component - display score
  var Total = new Vue({
    el: '#total',
    store,
    computed: Vuex.mapState({
      showResults: (state) => state[MANAGER].isShowResults,
      correct: (state) => state[ANSWER].correct,
      wrong: (state) => state[ANSWER].wrong
    })
  });
  
  // Buttons component to manage slides presentation via user interface
  var Buttons = new Vue({
    el: '#buttons',
    methods: {
      next: manager.next,
      prev: manager.prev,
      showAll: manager.showAll,
      showResults: manager.showResults
    }
  });
  
  return store;
}

/**
 * translations with locale support
 * @constant
 * @type {object}
 */
const translations = {
  _locale: 'he',
  locales: new Set(['he']),
  get locale() {
    return this._locale;
  },
  set locale(loc) {
    if (this.locales.has(loc)) {
      this._locale = loc;
    } else {
      console.warn(`locale ${loc} is not supported`);
    }
  },
  add(locale) {
    this.locales.add(locale);
  }
};

translations['he'] = {
  buttons: {
    next: 'הבא',
    previous: 'הקודם',
    showall: 'הצג הכל',
    total: 'סיכום',
  },
  results: {
    total: 'סיכום',
    correct: 'תשובות נכונות',
    wrong: 'שגיאות'
  },
  slides: {
    bonus: {
      title: '2 נקודות',
      text: 'בונוס - 2 נקודות'
    },
    source: 'מקור'
  }
}

/**
 * Get translation from translations object
 * @function translate
 * @param {string} path - path in translations object for the translation
 * @return {string} The translation string
 */
function translate(path) {
  let fullPath = `${translations.locale}.${path}`;
  return _.get(translations, fullPath, path);
}


/**
 * Get translation from translations object
 * @function translate
 * @param {string} path - path in translations object for the translation
 * @return {string} The translation string
 */
function SoundEffect(player) {
  player.currentTime = 1;
  player.play();
}

/**
 * initialize sound effect functionality
 * @function init
 * @param {object} PubSub - PubSub to subscribe to sound triggering events
 */
SoundEffect.init = function init(PubSub) {

  // download tracks
  var tracks = new Map();
  tracks.set(CORRECT, new Audio('http://audiosoundclips.com/wp-content/uploads/2014/02/Slidewhistle.mp3'));
  tracks.set(WRONG, new Audio('http://audiosoundclips.com/wp-content/uploads/2014/02/Bop2.mp3'));   

  // play sound when user chooses an answer
  PubSub.subscribe(ANSWER, (type, payload) => {
    var key = payload[CORRECT] ? CORRECT : WRONG;
    SoundEffect(tracks.get(key));
  });
}

main();
