
class MyFormValidator {
	constructor() {
		this.form = document.getElementById('myForm');
		this.submitBtn = document.getElementById('submitButton');
		this.resultContainer = document.getElementById('resultContainer');
		this.form.addEventListener('submit', e => this.submit(e));
		this.isSubmited = false;
		this.listResultContainerClass = ['progress', 'success', 'error'];
		this.fields = this.getAllFields();
	}

	getAllFields() {
		let fields = {};
		this.form.querySelectorAll('input').forEach(item => fields[item.name] = item);
		return fields;
	}
	// validation 
	validateEmail(email) {
		let domenCheckRegExpPart = [
			'ya.ru',
			'yandex.ru',
			'yandex.ua',
			'yandex.by',
			'yandex.kz',
			'yandex.com'
		].map(domain => domain.replace('.', '\\.')).join('|'); // escape dots and join it with or operator
		let regExp = new RegExp('^([a-z0-9_-]+\.)*[a-z0-9_-]+@(' + domenCheckRegExpPart + ')$');
		return regExp.test(email);
	}
	validatePhone(phone) {
		let regExp = new RegExp(/^(\+7)(\(?\d{3}\)?[\- ]?)(\d{3})([\-])(\d{2})([\-])(\d{2})$/);
		// replace everything except digits
		let listPhoneDigit = phone.replace(/[^0-9]/g, '').split(''), isValidSum = false;

		if (!regExp.test(phone)) return false;
		if (listPhoneDigit.reduce((prev, cur) => Number(prev) + Number(cur)) > 30) return false;

		return true;
	}
	validateFio(fio) {
		if (!fio) return false;
		let splitedFio = fio.trim().split(/\s+/);
		if (splitedFio.length != 3 ||  !splitedFio.every(item => item.length)) return false;
		return true;
	}
	// to get random response
	getRandomRequest() {
		let listRequest = ['error', 'progress', 'success'];
		return listRequest[Math.floor(Math.random() * 3)] + '.json';
	}
	ajax(url) {
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.overrideMimeType("application/json");
			xhr.open('POST', url, true);
			xhr.onreadystatechange = () => {
				if (xhr.readyState > 3 && xhr.status == 200) resolve(JSON.parse(xhr.responseText));
			}
			xhr.onerror = () => reject();
			xhr.send();
		});
	}

	resetResultContainerClasses() {
		if (this.resultContainer.classList) {
			this.listResultContainerClass.map(className => this.resultContainer.classList.remove(className));
		}
	}
	// required methods
	setData(payload) {
		for (let prop in payload) {
			if (prop in this.fields) this.fields[prop].value = payload[prop];
		}
	}
	getData() {
		let data = {};
		for (let key in this.fields) data[key] = this.fields[key].value;
		return data;
	}
	validate() {
		// remove error class from all fields
		for (let key in this.fields) this.fields[key].classList.remove('error');

		let errorFields = [];
		let { fio, email, phone } = this.getData();

		// validation methods at top of file
		if (!this.validateFio(fio)) errorFields.push('fio');
		if (!this.validateEmail(email)) errorFields.push('email');
		if (!this.validatePhone(phone)) errorFields.push('phone');

		errorFields.forEach(fieldName => this.fields[fieldName].classList.add('error'));
		return { isValid: errorFields.length == 0, errorFields }
	}
	async submit(e) {
		e.preventDefault();
		if (!this.isSubmited && this.validate().isValid) {
			this.isSubmited = true;
			this.submitBtn.classList.add('my-form__submit-btn--disabled');
			let response;
			while (true) {
				this.resetResultContainerClasses();
				// form action + random response file name (to test all responses)
				response = await this.ajax(e.target.action + this.getRandomRequest());
				if (response.status == 'progress') {
					this.resultContainer.classList.add('progress');
					// wait for timeout with await and continue loop
					await new Promise((resolve, reject) => setTimeout(resolve, response.timeout));
					continue;
				}
				break;
			}
			if (response.status == 'success') {
				this.resultContainer.innerHTML = 'Success';
				this.resultContainer.classList.add('success');
			}
			if (response.status == 'error') {
				this.resultContainer.classList.add('error');
				this.resultContainer.innerHTML = response.reason;
			}
			this.submitBtn.classList.remove('my-form__submit-btn--disabled');
		}
	}
}

const MyForm = new MyFormValidator();