function Question(text, answers, options={}) {
  answers = answers.map(answer => {
    return typeof answer !== 'object' ? [answer] : answer;
  });
  
  return Object.assign({
    text: text,
    answers: answers.map((answer) => ({text: answer[0], correct: !!answer[1]})),
  }, options);
}
  

var data = {
  slides: [
    {
      title: ['ספר בראשית'],
    },
    {
      title: ['חלק ראשון', 'שאלות על אדם וחווה'],
      questions: [
        new Question('במה התלבשו אדם וחווה?', [
            ['בעלי תאנה', true ],
            'בעלי זית',
            'בעלי דקל',          
        ]),
        new Question('מה החטא שעשו אדם וחווה?', [
            ['הם אכלו מפרי עץ הדעת', true],
            ['הם לכלכו את גן עדן'],
            ['הם בנו פסלים והשתחוו להם'],          
        ]),
        new Question('איזה עונש קיבלה חווה?', [
            ['יהיה לה קשה ללדת', true],
            ['היא הפכה לנציב מלח'],
            ['אבד לה הזכרון'],          
        ]),
      ]
    },
    {
      title: ['חלק שני', 'שאלות על קין והבל:'],
      questions: [
        new Question('מי היה האח הבכור?', [
          ['קין', true],
          ['הבל']
        ]),
        new Question('מי היה האח הצעיר ביותר', [
          ['קין'],
          ['הבל'],
          ['שת', true]
        ], { bonus: true}),
        new Question('מה היה המקצוע של קין והבל?', [
          ['קין - עבודת אדמה, הבל - רועה צאן', true],
          ['קין - רועה צאן, הבל - עבודת אדמה'],
          ['קין - טבח, הבל - זמר']
        ]),
        new Question('איזה חטא עשה קין?', [
          ['הוא קילל את אמו'],
          ['הוא הרג את הבל', true],
          ['הוא הרג את אביו']
        ]),
      ]
    }
  ]
}

function main() {
  var answers = {
    correct: 0,
    wrong: 0
  };
  
  // create and init slider
  var manager = new MySlideManager().start();
  
  fx.on('correct', (event) => fx.updateResult(event.type, answers));
  fx.on('wrong', (event) => fx.updateResult(event.type, answers));
  $('.questions').on('click', '.answers li', function(event) {
    var el = this;
    var $el = $(this);
    if ($el.data('handled')) {
      return;
    }
    var { correct, wrong } = COLORS;
    var color = $el.is('.correct') ? correct : wrong;

    // highlight click on correct answer
    fx.highlight({
      color: color,
      el: el
    });
    
    var eventType = (color == correct) ? EVENTS.correct : EVENTS.wrong;
    fx.trigger(eventType);
    $el.data('handled', true);
  });  
  
}

const EVENTS = {
  click: 'click',
  correct: 'correct',
  wrong: 'wrong'
}
const COLORS = {
  correct: 'green',
  wrong: 'red'
};
let $events = $({});
let fx = Object.create($events);
Object.assign(fx, {
  highlight({ color, el }) {
    $(el).css({ color: color });

    return this;
  },
  updateResult(result, answers) {
    if (result == 'correct') {
      answers.correct++;
    }
    if (result == 'wrong') {
      answers.wrong++;
    }

    $('.results .correct').text(answers.correct);
    $('.results .wrong').text(answers.wrong);
  }
});

class SlideManager {
  constructor() {
    this.pubsub = $({});
  }
  init(options={}) {
    // configuration
    Object.assign(this, this.defaults, options);

    // event handlers
    this.addEventHandlers();
    
    for (let prop in this) {
      var val = this[prop];
      if (prop.startsWith('on') && typeof val == 'function') {
        this.$on(prop.substr('on'.length), val);
      }
    }
    
    this.$emit('init');
    
    return this;
  }
  start() {
    if (this.current < 0) {
      this.current = 0;
    }
    this.$emit('start', [this.current]);
    
    return this;
  }
  addEventHandlers() {
    // button event handlers
    if (this.buttons !== null) {
      let { click } = this.events;
      let { nextSel, prevSel, showAllSel, next, prev, showAll } = this;
      let buttons = $(this.buttons);

      buttons.find(nextSel).on(click, next);
      buttons.find(prevSel).on(click, prev);
      buttons.find(showAllSel).on(click, showAll);
     
      this.$on('destroy', () => {
        buttons.find(nextSel).off(click, next);
        buttons.find(prevSel).off(click, prev);
        buttons.find(showAllSel).off(click, showAll);
      });
    }    
  }
  move(index) {
    var len = this.slides.length;

    if (len === 0) {
      return;
    }
    
    if (index >= len) {
      index = 0;
    }
    if (index < 0) {
      index = len - 1;
    }
  
    var oldIndex = index;
    this.current = index;
    this.$emit('move', [index, oldIndex]);
    
    return this;
  }
  next() {
    var idx = this.current + 1;
    if (this.isMoveAllowed(idx)){
      this.move(idx);
    }
    
    return this;
  }
  prev() {
    var idx = this.current - 1;
    if (this.isMoveAllowed(idx)){
      this.move(idx);
    }
    
    return this;
  }
  showAll() {
    this.$emit('showall');
    return this;
  }
  
  isMoveAllowed(index) {
    if (this.enableLoop) {
      return true;
    }
    if (index >= 0 && index < this.slides.length) {
      return true;
    }
    
    return false;
  }
  
  destroy() {
    Object.assign(this, this.defaults);
    this.$emit('destroy');
    return this;
  }
  $emit(...args){
    this.pubsub.trigger(...args);
    return this;
  }
  $on(...args) {
    this.pubsub.on(...args);
    return this;
  }
}

SlideManager.prototype.defaults = {
  slides: [],
  buttons: null,
  current: -1,
  isShowAll: false,
  enableLoop: false,
  events: EVENTS,
  nextSel: '.next',
  prevSel: '.prev',
  showAllSel: '.showAll',
  oninit: null,
  onstart: null,
  onmove: null,
  onshowall: null
}

class MySlideManager extends SlideManager {
  constructor(options={}) {
    super();
    
    var slider = this;
    slider.init({
      slides: $('section'),
      buttons: '.buttons',
      enableLoop: false,
      onstart: function onstart(event, currentIndex) {
        slider.move(currentIndex);
      },
      onmove: function onmove(event, index, oldIndex) {
        slider.slides.hide();
        slider.slides.eq(index).show();
        slider.isShowAll = false;
      },
      onshowall: function onshowall(event) {
        let { move, current, slides } = slider;
        if (slider.isShowAll) {
          move(current);
        } else {
          slides.show();
          slider.isShowAll = true;
        }
      },

      showResultsSelector: '.showResults',
      resultsSelector: '.total',
      onshowresults: function onshowresults(event) {
        $(slider.resultsSelector).toggle();
      }
    });
    
    return this;
  }
  
  addEventHandlers() {
    super.addEventHandlers();
    var { click } = EVENTS;
    $(this.showResultsSelector).on(click, this.showResults);
    this.$on('destroy', () => this.off(click, this.showResults));
    
    return this;
  }
  
  showResults() {
    this.$emit('showresults');
    return this;
  }
}
/**
 * Use boundMethod to bind all methods on the target.prototype
 */
function boundClass(target) {
  // (Using reflect to get all keys including symbols)
  let keys;
  // Use Reflect if exists
  if (false && typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    keys = Reflect.ownKeys(target.prototype);
  } else {
    keys = Object.getOwnPropertyNames(target.prototype);
    // use symbols if support is provided
    if (typeof Object.getOwnPropertySymbols === 'function') {
      keys = keys.concat(Object.getOwnPropertySymbols(target.prototype));
    }
  }
  
  keys.forEach(key => {
    // Ignore special case target method
    if (key === 'constructor') {
      return;
    }

    let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

    // Only methods need binding
    if (typeof descriptor.value === 'function') {
      Object.defineProperty(target.prototype, key, boundMethod(target, key, descriptor));
    }
  });
  return target;
}

/**
 * Return a descriptor removing the value and returning a getter
 * The getter will return a .bind version of the function
 * and memoize the result against a symbol on the instance
 */
function boundMethod(target, key, descriptor) {
  let fn = descriptor.value;
  if (typeof fn !== 'function') {
    throw new Error(`@autobind decorator can only be applied to methods not: ${typeof fn}`);
  }

  // In IE11 calling Object.defineProperty has a side-effect of evaluating the
  // getter for the property which is being replaced. This causes infinite
  // recursion and an "Out of stack space" error.
  let definingProperty = false;

  return {
    configurable: true,
    get() {
      if (definingProperty || this === target.prototype || this.hasOwnProperty(key)) {
        return fn;
      }

      let boundFn = fn.bind(this);
      definingProperty = true;
      Object.defineProperty(this, key, {
        value: boundFn,
        configurable: true,
        writable: true
      });
      definingProperty = false;
      return boundFn;
    }
  };
}

// bind methods
boundClass(SlideManager);
boundClass(MySlideManager);


main();
