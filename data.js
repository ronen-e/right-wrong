function Question(text, answers, options={}) {
	answers = answers.map(answer => {
		return typeof answer !== 'object' ? [answer] : answer;
	});

	return Object.assign({
		text: text,
		answers: answers.map((answer) => ({text: answer[0], correct: !!answer[1]})),
	}, options);
}

// Data for application
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
				], {source: 'https://he.wikipedia.org/wiki/%D7%A2%D7%9C%D7%94_%D7%AA%D7%90%D7%A0%D7%94#.D7.A1.D7.A4.D7.A8_.D7.91.D7.A8.D7.90.D7.A9.D7.99.D7.AA'}),
				new Question('מה החטא שעשו אדם וחווה?', [
					['הם אכלו מפרי עץ הדעת', true],
					'הם לכלכו את גן עדן',
					'הם בנו פסלים והשתחוו להם',          
				], {source: 'https://he.wikipedia.org/wiki/%D7%97%D7%98%D7%90_%D7%A2%D7%A5_%D7%94%D7%93%D7%A2%D7%AA#.D7.94.D7.97.D7.98.D7.90_.D7.95.D7.A2.D7.95.D7.A0.D7.A9.D7.95'}),
				new Question('איזה עונש קיבלה חווה?', [
					['יהיה לה קשה ללדת', true],
					'היא הפכה לנציב מלח',
					'אבד לה הזכרון',
				], {source: 'https://he.wikipedia.org/wiki/%D7%97%D7%98%D7%90_%D7%A2%D7%A5_%D7%94%D7%93%D7%A2%D7%AA#.D7.94.D7.97.D7.98.D7.90_.D7.95.D7.A2.D7.95.D7.A0.D7.A9.D7.95'}),
			]
		},
		{
			title: ['חלק שני:', 'שאלות על קין והבל'],
			questions: [
				new Question('מי היה האח הבכור?', [
					['קין', true],
					'הבל'
				], {source: 'https://he.wikipedia.org/wiki/%D7%A7%D7%99%D7%9F'}),
				new Question('מי היה האח הצעיר ביותר?', [
					'קין',
					'הבל',
					['שת', true]
				], { bonus: true, source: 'https://he.wikipedia.org/wiki/%D7%A9%D7%AA'}),
				new Question('מה היה המקצוע של קין והבל?', [
					['קין - עבודת אדמה, הבל - רועה צאן', true],
					'קין - רועה צאן, הבל - עבודת אדמה',
					'קין - טבח, הבל - זמר'
				], {source: 'https://he.wiktionary.org/wiki/%D7%A2%D7%95%D7%91%D7%93_%D7%90%D7%93%D7%9E%D7%94'}),
				new Question('איזה חטא עשה קין?', [
					'הוא קילל את אמו',
					['הוא הרג את הבל', true],
					'הוא הרג את אביו'
				], {source: 'https://he.wikipedia.org/wiki/%D7%A7%D7%99%D7%9F_%D7%95%D7%94%D7%91%D7%9C'}),
			]
		},
		{
			title: ['חלק שלישי:', 'נח והמבול'],
			questions: [
		
				new Question('למה נח נבחר ע"י אלוהים? כלומר מדוע "מצא חן בעיני ה"?', [
					['כי הוא היה צדיק', true],
					'כי הוא היה חכם',
					'כי הוא היה עשיר'
				], {source: 'https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%91%D7%95%D7%9C#.D7.91.D7.A0.D7.99.D7.99.D7.AA_.D7.94.D7.AA.D7.99.D7.91.D7.94'}),
				
				new Question('מי הייתה אשת נח?', [
					'שרה',
					'זלפה',
					['נעמה', true]
				], {source: 'https://he.wikipedia.org/wiki/%D7%A0%D7%A2%D7%9E%D7%94'}),
				
				new Question('מי היו ילדיו של נח?', [
					'שֵׁם, חַם וְקַר',
					['שֵׁם חַם וְיָפֶת', true],
					'שֵׁם חַם וְיִפְעַת'
				], {source: 'https://he.wikipedia.org/wiki/%D7%A0%D7%97'}),
				
				new Question('למה אלוהים עשה מבול?', [
					['כי אנשים היו רעים', true],
					'כי הייתה בצורת גדולה',
					'כי אנשים רצו לשחות'
				], {source: 'https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%91%D7%95%D7%9C#.D7.94.D7.A1.D7.99.D7.91.D7.95.D7.AA_.D7.9C.D7.9E.D7.91.D7.95.D7.9C'}),
			]
		},
		{
			title: ['חלק רביעי:', 'מגדל בבל'],
			questions: [
				new Question('למה בנו את מגדל בבל?', [
					['כי בני האדם רצו להגיע לשמיים', true],
					'כי בני האדם רצו לראות למרחקים',
					'כי בני האדם רצו לראות את אלוהים'
				], {source: 'https://he.wikipedia.org/wiki/%D7%9E%D7%92%D7%93%D7%9C_%D7%91%D7%91%D7%9C#.D7.94.D7.A1.D7.99.D7.A4.D7.95.D7.A8_.D7.94.D7.9E.D7.A7.D7.A8.D7.90.D7.99'}),
			
				new Question('למה אלוהים כעס על בניית המגדל?', [
					'כי בני האדם רצו לראותו',
					'כי המגדל חסם את הנוף',
					['כי דבר לא יהיה מעבר לכוחם', true]
				], {source: 'https://he.wikipedia.org/wiki/%D7%9E%D7%92%D7%93%D7%9C_%D7%91%D7%91%D7%9C#.D7.A4.D7.99.D7.A8.D7.95.D7.A9.D7.95_.D7.95.D7.9E.D7.92.D7.9E.D7.AA.D7.95'}),
				
				new Question('מה היה העונש שנתן אלוהים לבני האדם על בניית המגדל?', [
					['אלוהים בילבל את שפתם', true],
					'אלוהים זרק עליהם ברקים',
					'אלוהים הפך אותם לחיות בר'
				], {source: 'https://he.wikipedia.org/wiki/%D7%9E%D7%92%D7%93%D7%9C_%D7%91%D7%91%D7%9C#.D7.A4.D7.99.D7.A8.D7.95.D7.A9.D7.95_.D7.95.D7.9E.D7.92.D7.9E.D7.AA.D7.95'}),
			]
		},
		{
			title: ['חלק חמישי:', 'בריאת העולם'],
			questions: [
				new Question('בכמה ימים נברא העולם?', [
					'2 ימים',
					'7 ימים',
					['6 ימים', true]
				], { source: 'https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%9D_%D7%94%D7%A9%D7%91%D7%AA'}),
				
				new Question('על שם מה נקרא יום השבת?', [
					'על שם כוכב הלכת שבתאי',
					['כי אלוהים שבת מכל מלאכה', true],
					'הייתה שביתה של הסתדרות העובדים',
				], { source: 'https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%9D_%D7%94%D7%A9%D7%91%D7%AA'}),
				
				new Question('מה היה לפני בריאת העולם?', [
					['כלום', true],
					'תוהו ובוהו',
					'חושך',
				], { source: 'https://he.wikipedia.org/wiki/%D7%91%D7%A8%D7%99%D7%90%D7%AA_%D7%94%D7%A2%D7%95%D7%9C%D7%9D_(%D7%99%D7%94%D7%93%D7%95%D7%AA)#.D7.A4.D7.A8.D7.A9.D7.A0.D7.95.D7.AA'}),
			]
		},
		{
			title: ['חלק שישי:', 'אברהם אבינו'],
			questions: [
				new Question('איפה נולד אברהם אבינו?', [
					'חרן',
					['אור כשדים', true],
					'כנען'
				], {source: 'https://he.wikipedia.org/wiki/%D7%90%D7%91%D7%A8%D7%94%D7%9D'}),
				
				new Question('מה ציווה אלוהים על אברהם?', [
					'לזרוע הרבה זרעים בשדה',
					['ללכת לכנען', true],
					'ללכת לחרן'
				], {source: 'https://he.wikipedia.org/wiki/%D7%90%D7%91%D7%A8%D7%94%D7%9D'}),

				new Question('מה הבטיח אלוהים לאברהם?', [
					'שיחיה באושר ועושר',
					'שיקבל שובר מתנה לחג',
					[' שיירש את כל ארץ כנען ושצאצאיו ירבו כעפר הארץ', true],
				], {source: 'https://he.wikipedia.org/wiki/%D7%90%D7%91%D7%A8%D7%94%D7%9D#.D7.94.D7.94.D7.99.D7.A4.D7.A8.D7.93.D7.95.D7.AA_.D7.9E.D7.9C.D7.95.D7.98'})

			]
		}
	]
}