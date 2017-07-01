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
      title: ['חלק ראשון:', 'שאלות על אדם וחווה'],
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
      title: ['חלק שני:', 'שאלות על קין והבל'],
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
    },
    {
      title: ['חלק שלישי:', 'נח והמבול'],
      questions: [
        new Question('למה נח נבחר ע"י אלוהים? כלומר מדוע "מצא חן בעיני ה"?', [
          ['כי הוא היה צדיק', true],
          ['כי הוא היה חכם'],
          ['כי הוא היה עשיר']
        ]),
        new Question('מי הייתה אשת נח?', [
          ['שרה', true],
          ['זלפה'],
          ['נעמה']
        ]),
        new Question('מי היו ילדיו של נח?', [
          ['שֵׁם, חַם וְקַר'],
          ['שֵׁם חַם וְיָפֶת', true],
          ['שֵׁם חַם וְיִפְעַת']
        ]),
        new Question('למה אלוהים עשה מבול?', [
          ['כי אנשים היו רעים', true],
          ['כי הייתה בצורת גדולה'],
          ['כי אנשים רצו לשחות']
        ]),
      ]
    },
    {
      title: ['חלק רביעי:', 'מגדל בבל'],
      questions: [
        new Question('למה בנו את מגדל בבל?', [
          ['כי בני האדם רצו להגיע לשמיים', true],
          ['כי בני האדם רצו לראות למרחקים'],
          ['כי בני האדם רצו לראות את אלוהים']
        ]),
        new Question('למה אלוהים כעס על בניית המגדל?', [
          ['כי בני האדם רצו לראותו'],
          ['כי המגדל חסם את הנוף'],
          ['כי דבר לא יהיה מעבר לכוחם', true]
        ]),
        new Question('מה היה העונש שנתן אלוהים לבני האדם על בניית המגדל?', [
          ['אלוהים בילבל את שפתם', true],
          ['אלוהים זרק עליהם ברקים'],
          ['אלוהים הפך אותם לחיות בר']
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
  $('body').on('click', '.questions .answers li', function(event) {
    
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
//     this.addEventHandlers();
    
    for (let prop in this) {
      var fn = this[prop];
      if (prop.startsWith('on') && typeof fn == 'function') {
        this.$on(prop.substr('on'.length), fn);
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
      oninit: function oninit() {
        slider.addEventHandlers();
      },
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
    // button event handlers
    let { click } = this.events;
    let { nextSel, prevSel, showAllSel, showResultsSelector,
         next, prev, showAll, showResults } = this;
    let buttons = $(this.buttons);

    buttons.find(nextSel).on(click, next);
    buttons.find(prevSel).on(click, prev);
    buttons.find(showAllSel).on(click, showAll);
    buttons.find(showResultsSelector).on(click, showResults);

    this.$on('destroy', () => {
      buttons.find(nextSel).off(click, next);
      buttons.find(prevSel).off(click, prev);
      buttons.find(showAllSel).off(click, showAll);
      buttons.find(showResultsSelector).off(click, showResults);
    });
  }
  
  showResults() {
    this.$emit('showresults');
    return this;
  }
}

// bind methods
boundClass(SlideManager);
boundClass(MySlideManager);

// Vue js
function initVue(){
  Vue.component('x-slide', {
    template: '#x-slide',
    props: ['data', 'title', 'questions'],
    data: function() { return {} }
  });
  Vue.component('x-slide-header', {
    template: '#x-slide-header',
    props: ['title'],
    data: function() { return {} },
  });
  Vue.component('x-slide-body', {
    template: '#x-slide-body',
    props: ['questions'],
    data: function() { return {}; },
  });
  Vue.component('x-slide-question', {
    template: '#x-slide-question',
    props: ['text', 'answers', 'bonus'],
    data: function() { return {}; },
  });
  Vue.component('x-slide-answer', {
    template: '#x-slide-answer',
    props: ['text', 'correct'],
    data: function() { return {}; },
  });
  new Vue({
    el: '#vue-slider',
    template: '#x-slider',
    data: function() {
      return {
        data: data,
        slides: data.slides,
      }
    }
  })
}

main();
initVue();