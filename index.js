function main() {
  console.clear();

  // create and init slider
  var manager = new MySlideManager();
  const store = initVue({ manager: manager, answers: answers, data: data });
  
  SoundEffect.init();
  PubSub.subscribe(ANSWER, (type, payload) => SoundEffect(payload));
}


let types = {
  ANSWER: 'answer',
  CORRECT: 'correct',
  WRONG: 'wrong',
}
var { ANSWER, CORRECT, WRONG } = types;

var answers = Object.create({
  update: function update({ correct, bonus}) {
    if (correct) {
      this[CORRECT]++;
      if (bonus) {
        this[CORRECT]++;
      }
    }
    if (!correct) {
      this[WRONG]++;
    }    
  }  
});
answers[CORRECT] = 0;
answers[WRONG] = 0;

function createStore(config) {
  const store = new Vuex.Store({
    //strict: true,
    state: {
      slides: config.data.slides,
      manager: config.manager,
      answers: config.answers
    },
    mutations: {
      [ANSWER](state, payload) {
        state.answers.update(payload);
      },
    },
  });
  
  return store;
}

class SlideManager {
  constructor() {
    this.pubsub = Object.create(PubSub);
  }
  init(options={}) {
    // configuration
    Object.assign(this, this.defaults, options);

    for (let prop in this) {
      var fn = this[prop];
      if (prop.startsWith('on') && typeof fn == 'function') {
        this.$on(prop.substr('on'.length), fn);
      }
    }
    
    this.$emit('init');
    
    return this;
  }
  
  get length() {
    return this.slides.length;
  }
  
  isEmpty() {
    return this.length === 0;
  }
  
  start() {
    if (!this.isEmpty() && this.current < 0) {
      this.current = 0;
    }
    this.$emit('start', [this.current]);
    
    return this;
  }

  move(index) {
    if (this.isMoveAllowed(index)) {
      index = index % this.length;

      var oldIndex = this.current;
      this.current = index;
      this.$emit('move', [index, oldIndex]);      
    }
    return this;
  }

  isMoveAllowed(index) {
    return (this.length > 0 && index >= 0 && index < this.length);
  }
  
  $emit(...args){
    this.pubsub.publish(...args);
  }
  
  $on(...args) {
    this.pubsub.subscribe(...args);
  }
}

SlideManager.prototype.defaults = {
  slides: [],
  current: -1,
  oninit: null,
  onstart: null,
  onmove: null,
  externalState: false,
}

class MySlideManager extends SlideManager {
  constructor() {
    super();
    var slider = this;
    slider.init({
      slides: data.slides,
      onstart: function onstart(event, currentIndex) {
        slider.move(currentIndex);
      },
      onmove: function onmove(event) {
        slider.isShowAll = false;
      },
      onshowall: function onshowall(event) {
        slider.toggle('isShowAll');
      },
      onshowresults: function onshowresults(event) {
        slider.toggle('isShowResults');
      }
    })
    .start();
  }
  next() {
    return this.move(this.current + 1);
  }
  prev() {
    return this.move(this.current - 1);
  }
  showAll() {
    this.$emit('showall');
  }
  showResults() {
    this.$emit('showresults');
  }
  toggle(prop) {
    this.$emit('toggle', { prop });
    this[prop] = !this[prop];
  }
} 

MySlideManager.prototype.defaults = Object.assign(
  {},
  MySlideManager.prototype.defaults, 
  {
    isShowAll: false,
    isShowResults: false,
    onshowall: null,
    onshowresults: null
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
  
  Vue.component('x-slide', {
    template: '#x-slide',
    props: ['title', 'questions'],
  });
  Vue.component('x-slide-header', {
    template: '#x-slide-header',
    props: ['title'],
  });
  Vue.component('x-slide-body', {
    template: '#x-slide-body',
    props: ['questions'],
  });
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
        PubSub.publish(ANSWER, { correct: correct, bonus: this.bonus});
      },
      handle() {
        this.handled = true;
      }
    },
    watch: {
      answerCount(currentCount, oldCount) {
        if (!this.handled && currentCount === this.answers.length-1) {
          this.handle();
          this.revealAnswer = true;
        }
      }
    }
  });
  
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
        this.$emit(ANSWER, {correct: this.correct});
      }
    }
  });
  Vue.component('x-slide-bonus', {
    template: '#x-slide-bonus',
  });
  Vue.component('x-slide-source', {
    template: '#x-slide-source',
    props: ['source']
  });
  
  var App = new Vue({
    el: '#vue-slider',
    template: '#x-slider',
    store: store,
    computed: Vuex.mapState({
      slides: state => state.slides,
      manager: 'manager'
    }),
    methods: {
      show(index) {
        return manager.isShowAll || index === manager.current;
      }
    }
  });    
  
  var Total = new Vue({
    el: '#total',
    store,
    computed: Vuex.mapState({
      showResults: (state) => state.manager.isShowResults,
      correct: (state) => state.answers.correct,
      wrong: (state) => state.answers.wrong
    })
  });
  
  var Buttons = new Vue({
    el: '#buttons',
    store,
    methods: {
      next: manager.next,
      prev: manager.prev,
      showAll: manager.showAll,
      showResults: manager.showResults
    }
  });
  
  return store;
}


const translations = {
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
function translate(path) {
  return _.get(translations, path, path);
}

function SoundEffect(payload) {
  try {
    var player = payload[CORRECT] ? SoundEffect[CORRECT] : SoundEffect[WRONG];
    player.currentTime = 1;
    player.play();
  } catch (e) {}
}

SoundEffect.init = function initSound() {
  try {
    SoundEffect[CORRECT] = new Audio('http://audiosoundclips.com/wp-content/uploads/2014/02/Slidewhistle.mp3');
    SoundEffect[WRONG] = new Audio('http://audiosoundclips.com/wp-content/uploads/2014/02/Bop2.mp3');   
  }
  finally {
    return SoundEffect;
  }
}

main();
