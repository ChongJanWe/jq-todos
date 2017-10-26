(function () {
	'use strict';

	//获取输入框
	var $newTodo = $('.new-todo');
	//获取ul
	var $todoList = $('.todo-list');
	//获取list初始值，如果有则获取，没有则为空数组
	var listArr = store.get('todoList') || [];
	//获取全选按钮
	var $toggleAllBtn = $('#toggle-all');
	var $arrow = $('.toggle-all:checked + label:before');
	//获取显示未完成数量的盒子
	var $todoCount = $('.todo-count strong');
	//获取filters
	var $filters = $('.filters li a');
	//定义一个显示哪些项目的全局变量
	var show = 'all';

	// console.log($newTodo);
	refresh();
	add_list();
	delete_li();
	toggle_check();
	toggle_all();
	filter_todos();
	clear_completed();
	dblclick_edit();

	//输入文本点击回车存储
	function add_list() {
		$(document).on('keyup', '.new-todo', function(event) {
			event.preventDefault();
			// 点击了回车键
			if (event.which == '13') {
				// 判断输入是否为空
				if (!$newTodo.val()) return;

				//不为空则存储下来
				
				// 分别存储到listArr和localStorage
				var tempObj = {};
				tempObj.completed = false;
				tempObj.contents = $newTodo.val();
				listArr.push(tempObj);
				//存在localstorage
				store.set('todoList',listArr);
				//清空输入框
				$newTodo.val("");
				//重新渲染
				refresh();
			}	
		});
	}

	//刷新页面
	function refresh() {
		//定义一个未完成项目的数量，判断是否要让全选高亮
		var comNum = 0;
		//清空html
		$todoList.html(null);
		//循环创建li
		//当选择了 all 按钮 ，显示全部
		if (show === 'all') {
			$.each(listArr, function(index, ele) {
				 $todoList.append(creat_li(ele,index));
				 if (!ele.completed) {
				 	comNum++;
				 }
			});
		}
		//当选择了 active 按钮，显示未完成的
		else if (show === 'active') {
			$.each(listArr, function(index, ele) {
				 if (!ele.completed) {
				 	$todoList.append(creat_li(ele,index));
					comNum++;
				 }
			});
		}
		//当选择了 completed 按钮，显示完成的
		else {
			$.each(listArr, function(index, ele) {
				if (ele.completed) {
					$todoList.append(creat_li(ele,index));
				} else {
					comNum++;
				}
			});			
		}
		
		
		//值为零说明全部完成，要让全选高亮
		if (comNum==0) {
			$toggleAllBtn.attr("checked","checked");
			$arrow.css('color', '#737373');
		} else {
			$toggleAllBtn.removeAttr('checked');
			$arrow.css('color', '#e6e6e6');
		}
		//显示在底部
		$todoCount.html(comNum);
	}

	//创建li
	function creat_li(data,index) {
		var str = 	'<li'+ (data.completed?' class=completed':'') + ' data-index='+ index +'>' +
						'<div class="view">' +
							'<input class="toggle" type="checkbox"'+ (data.completed?'checked':'') +'>' +
							'<label>'+ data.contents +'</label>' +
							'<button class="destroy"></button>' +
						'</div>' +
						'<input class="edit" value="">' +
					'</li>' ;
		return str;
	} 

	//点击删除删除当前li
	function delete_li() {
		$(document).on('click', '.destroy', function(event) {
			event.preventDefault();
			//删除listArr中对应的项
			
			listArr.splice($(this).parents('li').data('index'),1);
			
			//存储到数据库
			store.set('todoList',listArr);

			//刷新页面
			refresh();
		});
	}

	//点击checkbox切换勾选状态
	function toggle_check() {
		$(document).on('click', '.toggle', function(event) {
			event.preventDefault();
			//切换当前项勾选状态
			listArr[$(this).index('.toggle')].completed = !listArr[$(this).index('.toggle')].completed;
			//存储到数据库
			store.set('todoList',listArr);
			//重新渲染
			refresh();
		});
	}

	//全选
	function toggle_all() {
		//点击label或者点击checkbox都是一样结果
		$(document).on('click', '#toggle-all', function(event) {
			var flag = $toggleAllBtn.is(':checked');
			$.each(listArr, function(index, ele) {
				ele.completed = flag;
			});
			//存储到数据库
			store.set('todoList',listArr);
			//重新渲染
			refresh();
		});
	}

	//过滤
	function filter_todos() {
		$(document).on('click', '.filters a', function (event) {
			event.preventDefault();

			//移除所有按钮的class
			$.each($filters, function(index, ele) {
				//将ele转化为jq对象才有removeClass方法
				$(ele).removeClass('selected');
			});
			//给当前选中的按钮加上class
			$(this).addClass('selected');

			//将按下按钮的文本传给全局的show
			show = $(this).html().toLowerCase();
			refresh();
		})
	}

	//清除已完成的
	function clear_completed() {
		$(document).on('click', '.clear-completed', function(event) {
			event.preventDefault();

			//删除完成的   这里本来用each 但是发现each用在删除数组元素上不好用
			for (var i = 0; i < listArr.length; i++) {
				if (listArr[i].completed) {
					listArr.splice(i,1);
				}
			}
			store.set("todoList",listArr);
			refresh();
		});
	}


	//双击修改
	function dblclick_edit() {
		$(document).on('dblclick', '.todo-list li .view label', function(event) {
			event.preventDefault();
			window.getSelection().removeAllRanges();
			$(this).parents('li').addClass("editing")
				   .find('.edit').val($(this).text()).focus();
		});

		$(document).on('blur', '.edit', function () {
			//让label的值改变
			if ($(this).val()) {
				$(this).parent().find('.view label').text($(this).val())
			}
			$(this).parents('li').removeClass("editing");
			//存储
			var index = $(this).index('.edit');
			listArr[index].contents = $(this).parent().find('.view label').text();
			store.set('todoList', listArr);
			refresh();
		})
	}


})();
