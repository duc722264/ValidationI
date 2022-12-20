
function Validator(options) {

    // Get ra thẻ cha của inputElement cho đến khi gặp cha có selector
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {

    };

    // Hàm thực hiện validate
    function validate(inputElement, rule) {

        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector); // Thẻ span message khi user nhập lỗi

        var errorMessage; // .form-message

        //  Lấy ra các rules của selector
        var rules = selectorRules[rule.selector]  // Biến chứa rule của mỗi field

        // Lặp qua từng rule và check
        // Nếu có lỗi dừng check
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                    default:
                        errorMessage = rules[i](inputElement.value)
            }

            if(errorMessage) break;
        }


                    if(errorMessage) {
                        errorElement.innerText = errorMessage // Trong trường hợp có lỗi in ra message
                        getParent(inputElement, options.formGroupSelector).classList.add('invalid') 
                    }else {
                        errorElement.innerText = ''     // Không có lỗi in ra rỗng --> Không in gì cả
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

                    }

                return !errorMessage; // error message true --> Không có lỗi
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form); //#form-1

    if(formElement) {   // Nếu có #form-1

        // Khi submit form (Đăng ký, Đăng nhập)
        formElement.onsubmit = function(e) {
            e.preventDefault();         // Ngăn chặn hành vi mặc định của submit

            var isFormValid = true; // Mặc định form valid true

            // Lặp qua từng rules và validate luôn
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector); 

                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            })

            if(isFormValid) {
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');  // DOM element có attribute name là những input

                    var formValues = Array.from(enableInputs).reduce(function(values, input) { // convert formvalue sang array
                        
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                                case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = []; 
                                    return values;    // Nếu input không có checked thì return luôn values
                                }
                                if(!Array.isArray(values[input.name])) values[input.name] = []; // Nếu value input không phải array --> []
                                values[input.name].push(input.value)   // push value input
                                break;
                                case 'file':
                                    values[input.name] = input.files;
                                    break;
                            default:
                                values[input.name] = input.value;
                        }
                        return  values;    // 
                    }, {})

                    options.onSubmit(formValues);
                } else {    // Trường hợp submit với hành vi mặc định
                    formElement.submit();
                }
            }
        }

        // Lặp qua mỗi rule và xử lí (lắng nghe sự kiện blur, input ...)
        options.rules.forEach(function(rule) { // Duyệt từng phần trong mảng options.rules

            // Lưu lại các rules cho mỗi input
        
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test); // push rule vào trong mảng cho các lần chạy 
            }else {
                selectorRules[rule.selector] = [rule.test]; // Ban đầu chưa có rule nào sẽ được tạo thành 1 mảng rỗng

            }

            
            var inputElements = formElement.querySelectorAll(rule.selector); 

            Array.from(inputElements).forEach(function(inputElement) {
                    // Xử lí trường hợp blur khỏi input
                inputElement.onblur = function() {
                    // value: inputElement.value --> value user nhập
                    // test func = rule.test
                    validate(inputElement, rule)
                }

                // Xử lí mỗi khi user nhập input --> Bỏ msg error và invalid 
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector); // Thẻ span message khi user nhập lỗi

                    errorElement.innerText = ''     // Không có lỗi in ra rỗng --> Không in gì cả
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
                          
        })
    }
}

// Định nghĩa các rule  
// Nguyên tắc của các rules
    // 1 Khi có lỗi trả message lỗi
    // 2 Khi hợp lệ không trả về gì cả (undefined)
Validator.isRequired = function(selector, message) { // message customed message
    return {
        selector: selector,
        test: function(value) {
            var res;
            if(typeof value === 'string') res = value.trim() ? undefined : message || "Vui lòng nhập trường này" 
            // Nếu có value thì không trả về gì còn ngược lại in ra code
             // .trim() để k tính các dấu cách
            else res = value ? undefined : message || "Vui lòng nhập trường này"  
            return res;
        }
    }
}

// Rule check email
Validator.isEmail = function(selector, message) {   
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // Mã regex email validation

            return regex.test(value) ? undefined : message || 'Trường này phải là email' // Trong trường hợp value là email validation
        }
    }
}

// Rule check length password
Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}


// Rule confirm password 
Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}
