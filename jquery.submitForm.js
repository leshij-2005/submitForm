/*
 ! Submit Form v1.5 | (c) 2013 - 2015 Ershov Alexey
*/
(function($) {

  var FIELDS = ['INPUT', 'SELECT', 'TEXTAREA'];
  var STATE = {
    processing: 'processing',
    error: 'error',
    success: 'success'
  };

  var fields = [];
  
  var validators = {
    required: function(item){
      var value = item.type == 'radio' || item.type == 'checkbox' ? item.checked : $(item).val().trim();
      
      if (!value)
        $(item).addClass('invalid');
      return !!value;
    },
    phone: function(item){
      var value = $(item).val();
      var valid = true;

      if (!(/^[0-9()\-+\s]+$/).test(value) || !(value.length >= 6))
      {
        $(item).addClass('invalid');
        valid = false;
      }
      return valid;
    },
    email: function(item){
      var value = $(item).val();
      var valid = true;

      if (!(/^([a-z0-9_\-]+\.)*[a-z0-9_\-]+@([a-z0-9][a-z0-9\-]*[a-z0-9]\.)+[a-z]{2,4}$/i).test(value))
      {
        $(item).addClass('invalid');
        valid = false;
      }
      return valid;
    }
  };

  function searchField(node){
    $(node.children).each(function(index, item){
      if(jQuery.inArray(item.nodeName, FIELDS) != -1 && !item.disabled)
        fields.push(item);
      if(item.childElementCount)
        searchField(item);
    });
    return fields;
  }

  function validate(){
    var that = this;
    fields = [];
    this.fields = searchField(this);
    
    $.each(validators, function(key, item){
      $(that).removeClass('invalid-' + key);
    });

    var valid = false;
    for (var i = 0; item = this.fields[i]; i++)
    {
      var validAttr = $(item).attr('data-validate');
      
      if(validAttr)
      {
        var valids = validAttr.split(', ');
        for (var j = 0; validator = valids[j]; j++)
        {
          var f = validators[validator];

          $(item).removeClass('invalid');
          valid = f(item);
          if(!valid) 
          {
            $(item).focus()
            $(this).addClass('invalid-' + validator);
            
            item.addEventListener('keyup', function(){
              $(this).removeClass('invalid');
            });

            item.addEventListener('change', function(){
              $(this).removeClass('invalid');
            });

            break;
          }
        }

        if(!valid)
        {
          if (this.options.invalidHandler != undefined)
            this.options.invalidHandler(item);

          break;
        }
      }
      else
        valid = true;
    }

    return valid;
  };

  function submit(){

    $.each(STATE, function(idx, state){
      $(this).removeClass(state);
    });
     
    if (validate.call(this))
    {
      var data = {};
      $(this.fields).each(function(index, item){
        var name = item.name || item.id;
        
        if ((item.type == 'radio' || item.type == 'checkbox') && item.checked)
        {
          if (!data[name])
            data[name] = $(item).val();
          else
          {
            if (typeof data[name] != 'object')
              data[name] = [data[name]];
              
            data[name].push($(item).val());
          }
        }
        
        if (item.type == 'text' || item.type =='hidden' || item.type =='password' || item.nodeName == 'SELECT' || item.nodeName == 'TEXTAREA')
          data[name] = $(item).val(); 
      });
      
      data = this.options.prepare(data);

      if(this.options.ajaxObject)
        this.options.ajaxObject['data'] = data;
      else
        this.options.ajaxObject = {
          url:  this.options.source,
          type: this.options.method,
          data:  data,
          beforeSend: this.options.onBeforeSend,
          success: this.options.onSuccess,
          error: this.options.onError
        }
      $.ajax(this.options.ajaxObject);
    }   
    return false;
  };

  var methods = {
    init: function(params) {

      return this.each(function(){
   
        var $this = $(this),
            data = $this.data('submitForm');

        var defaults = {
          ajaxObject: null,
          source: '/',
          method: 'POST',
          responseElement: $('<div>',{
            class: 'submit-form-response'
          }),
          onBeforeSend: function(obj){
            $this.addClass(STATE.processing);
          },
          onSuccess: function(response, status, obj){
            $this.removeClass(STATE.processing);
            $this.addClass(STATE.success);
            
            var s = $this.context.options.success(response);
            if (s || s == undefined)
              $this.context.options.responseElement.html(response);
          },
          onError: function(obj, status, error){
            $this.removeClass(STATE.processing);
            $this.addClass(STATE.error);
            
            var s = $this.context.options.error ? $this.context.options.error(status, error) : undefined;
            if (s)
              $this.context.options.responseElement.html(error);
          },
          success: function(response){},
          prepare: function(data){ return data; }
        };

        var options = $.extend({}, defaults, params);
        this.options = options;
        
        
        if (this.options.responseElement == defaults.responseElement)
          $(this).append(this.options.responseElement);

        $(this).submit(submit);
      });     
    }
  };

  $.fn.submitForm = function(method){
    if (methods[method])
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    else 
      if (typeof method === 'object' || !method) {
        return methods.init.apply(this, arguments);
      } 
      else
        $.error('Method "' +  method + '" not found!');
  };
})(jQuery);