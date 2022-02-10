//remove class from a set of items
export const removeClasses = (elemSet: NodeListOf<Element>, className: string) => {

    elemSet.forEach(elem => {

        elem.classList.remove(className);

    });

};

export const setMaterialEffectMishell = () => {
    const inputs = document.querySelectorAll("input.mish");
    inputs.forEach((inputRaw) => {
        const input = inputRaw as any;
        if (input.value.trim().length != 0) {
            input.previousElementSibling.classList.add("top");
        }
        input.onfocus = () => {
            input.previousElementSibling.classList.add("top");
            input.previousElementSibling.classList.add("focus");
            input.parentNode.classList.add("focus");
        };
        input.onblur = () => {
            input.value = input.value.trim();
            if (input.value.trim().length === 0) {
                input.previousElementSibling.classList.remove("top");
                input.previousElementSibling.classList.remove("focus");
                input.parentNode.classList.remove("focus");
            }
        };
    });
}

export function getInputDataInSelector(selector: string) {
    const formMap : { [key: string]: any } = {};
    const formElems = document.querySelectorAll(selector + ' [name]');
    for(var i = 0; i < formElems.length; i++){
        const el = formElems[i] as any;
        if (el.type && el.type === 'checkbox') {
            // for checkboxes we only store the value if it is checked
            if (el.checked) { 
                formMap[el.name] = el.value;    
            }
        } else {
            formMap[el.name] = el.value;
        }
    }
    return formMap;
  }
  