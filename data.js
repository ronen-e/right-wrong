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
					'הם לכלכו את גן עדן',
					'הם בנו פסלים והשתחוו להם',          
				]),
				new Question('איזה עונש קיבלה חווה?', [
					['יהיה לה קשה ללדת', true],
					'היא הפכה לנציב מלח',
					'אבד לה הזכרון',
				]),
			]
		},
		{
			title: ['חלק שני:', 'שאלות על קין והבל'],
			questions: [
				new Question('מי היה האח הבכור?', [
					['קין', true],
					'הבל'
				]),
				new Question('מי היה האח הצעיר ביותר', [
					'קין',
					'הבל',
					['שת', true]
				], { bonus: true}),
				new Question('מה היה המקצוע של קין והבל?', [
					['קין - עבודת אדמה, הבל - רועה צאן', true],
					'קין - רועה צאן, הבל - עבודת אדמה',
					'קין - טבח, הבל - זמר'
				]),
				new Question('איזה חטא עשה קין?', [
					'הוא קילל את אמו',
					['הוא הרג את הבל', true],
					'הוא הרג את אביו'
				]),
			]
		},
		{
			title: ['חלק שלישי:', 'נח והמבול'],
			questions: [
				new Question('למה נח נבחר ע"י אלוהים? כלומר מדוע "מצא חן בעיני ה"?', [
					['כי הוא היה צדיק', true],
					'כי הוא היה חכם',
					'כי הוא היה עשיר'
				]),
				new Question('מי הייתה אשת נח?', [
					['שרה', true],
					'זלפה',
					'נעמה'
				]),
				new Question('מי היו ילדיו של נח?', [
					'שֵׁם, חַם וְקַר',
					['שֵׁם חַם וְיָפֶת', true],
					'שֵׁם חַם וְיִפְעַת'
				]),
				new Question('למה אלוהים עשה מבול?', [
					['כי אנשים היו רעים', true],
					'כי הייתה בצורת גדולה',
					'כי אנשים רצו לשחות'
				]),
			]
		},
		{
			title: ['חלק רביעי:', 'מגדל בבל'],
			questions: [
				new Question('למה בנו את מגדל בבל?', [
					['כי בני האדם רצו להגיע לשמיים', true],
					'כי בני האדם רצו לראות למרחקים',
					'כי בני האדם רצו לראות את אלוהים'
				]),
				new Question('למה אלוהים כעס על בניית המגדל?', [
					'כי בני האדם רצו לראותו',
					'כי המגדל חסם את הנוף',
					['כי דבר לא יהיה מעבר לכוחם', true]
				]),
				new Question('מה היה העונש שנתן אלוהים לבני האדם על בניית המגדל?', [
					['אלוהים בילבל את שפתם', true],
					'אלוהים זרק עליהם ברקים',
					'אלוהים הפך אותם לחיות בר'
				]),
			]
		}
	]
}