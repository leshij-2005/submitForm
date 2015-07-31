/*
 ! Submit Form v1.5 | (c) 2013 - 2015 Ershov Alexey
*/
(function($) {

  var mapFields = ['INPUT', 'SELECT', 'TEXTAREA'];
  var fields = [];
  
  var validators = {
    required: function(item){
      var value = item.type == 'radio' || item.type == 'checkbox' ? item.checked : $(item).val().trim();
      $(item).removeClass('invalid');
      
      if (!value)
        $(item).addClass('invalid');
      return !!value;
    },
    phone: function(item){
      var value = $(item).val();
      var valid = true;
      $(item).removeClass('invalid');

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
      $(item).removeClass('invalid');

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
      if(jQuery.inArray(item.nodeName, mapFields) != -1 && !item.disabled)
        fields.push(item);
      if(item.childElementCount)
        searchField(item);
    });
    return fields;
  }

  function validate(){
    fields = [];
    this.fields = searchField(this);
    
    $(this).removeClass('invalid-required').removeClass('invalid-phone').removeClass('invalid-email');

    var valid = false;
    for(var i = 0; i < this.fields.length; i++){
      var item = this.fields[i];
      var validAttr = $(item).attr('data-validate');
      
      if(validAttr)
      {
        var valids = validAttr.split(', ');
        for(var j = 0; j < valids.length; j++)
        {
          var f = validators[valids[j]];
          valid = f(item);
          if(!valid) 
          {
            $(item).focus()
            $(this).addClass('invalid-' + valids[j]);
            
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
    $(this).removeClass('processing').removeClass('success').removeClass('error');
     
    if (validate.call(this))
    {
      var data = {};
      $(this.fields).each(function(index, item){
        var name = item.name || item.id;
        
        if ((item.type == 'radio' || item.type == 'checkbox') && item.checked)
          data[name] = $(item).val();
        
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
            $this.removeClass('error');
            $this.addClass('processing');
          },
          onSuccess: function(response, status, obj){
            $this.removeClass('processing');
            $this.addClass('success');
            
            var s = $this.context.options.success(response);
            if (s || s == undefined)
              $this.context.options.responseElement.html(response);
          },
          onError: function(obj, status, error){
            $this.removeClass('processing');
            $this.addClass('error');
            
            var s = $this.context.options.error(status, error);
            if (s || s == undefined)
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