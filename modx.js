var mainMenu = {
	startrefresh: function(a) {
		modx.startrefresh(a)
	},
	work: function() {
		modx.work()
	},
	reloadtree: function() {
		modx.tree.reloadtree()
	}
};

var tree = {
	restoreTree: function() {
		modx.tree.restoreTree()
	},
	saveFolderState: function() {
		modx.tree.saveFolderState()
	},
	updateTree: function() {
		modx.tree.updateTree()
	},
	ca: "open",
	document: document
};

var reloadtree = function() {
	modx.tree.reloadtree()
};

var setLastClickedElement = function(type, id) {
	modx.setLastClickedElement(type, id)
};

(function($, w, d, undefined) {
	$.extend(modx, {
		work: function() {
			if($('#workText').length) {
				$('#workText').html('<i class="fa fa-warning"></i>&nbsp;' + modx.lang.working);
			} else {
				setTimeout(function() {
					modx.work()
				}, 50);
			}
		},
		stopWork: function() {
			if($('#workText').length) {
				$('#workText').html('');
			} else {
				setTimeout(function() {
					modx.stopWork()
				}, 50);
			}
		},
		getQueryVariable: function(variable, query) {
			var vars = query.split('&');
			for(var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				if(decodeURIComponent(pair[0]) == variable) {
					return decodeURIComponent(pair[1]);
				}
			}
		},
		scrollWork: function() {
			var frm = d.getElementById("mainframe").contentWindow;
			currentPageY = localStorage.getItem('page_y');
			pageUrl = localStorage.getItem('page_url');
			if(currentPageY === undefined) {
				localStorage.setItem('page_y', 0);
			}
			if(pageUrl === null) {
				pageUrl = frm.location.search.substring(1);
			}
			if(modx.getQueryVariable('a', pageUrl) == modx.getQueryVariable('a', frm.location.search.substring(1))) {
				if(modx.getQueryVariable('id', pageUrl) == modx.getQueryVariable('id', frm.location.search.substring(1))) {
					frm.scrollTo(0, currentPageY);
				}
			}

			frm.onscroll = function() {
				if(frm.pageYOffset > 0) {
					localStorage.setItem('page_y', frm.pageYOffset);
					localStorage.setItem('page_url', frm.location.search.substring(1));
				}
			}
		},
		startrefresh: function(rFrame) {
			if(rFrame == 1) {
				x = w.setTimeout('reloadtree()', 500);
			}
			if(rFrame == 2) {
				x = w.setTimeout('reloadmenu()', 500);
			}
			if(rFrame == 9) {
				x = w.setTimeout('reloadmenu()', 500);
				y = w.setTimeout('reloadtree()', 500);
			}
			if(rFrame == 10) {
				w.location.href = "../" + modx.MGR_DIR;
			}
		},
		setLastClickedElement: function(type, id) {
			localStorage.setItem('MODX_lastClickedElement', '[' + type + ',' + id + ']');
		},
		removeLocks: function() {
			if(confirm(modx.lang.confirm_remove_locks) === true) {
				top.main.location.href = "index.php?a=67";
			}
		},
		ExtractNumber: function(value) {
			var n = parseInt(value);
			return n == null || isNaN(n) ? 0 : n
		},
		mainmenu: {
			init: function() {
				var menu = $('#mainMenu', d);
				$('.nav>li>a', menu).click(function() {
					$('.nav>li:not(:hover)', menu).removeClass('active').addClass('close');
					$(this).closest('li').toggleClass('active');
				});

				$('.nav>li li a', menu).click(function() {
					$('.nav>li', menu).removeClass('active').addClass('close');
					$(this).closest('li.dropdown').addClass('active')
				});

				$('.nav>li', menu).hover(function() {
					$(this).removeClass('close')
				})
			}
		},
		init_sideBar: function() {
			$('#hideMenu', d).click(function() {
				var pos = 0;
				if($('#tree', d).width()) {
					$(d.body).removeClass('tree-show').addClass('tree-hide');
				} else {
					$(d.body).addClass('tree-show').removeClass('tree-hide');
					pos = 320
				}
				$(d.body).removeClass('resizer-move');
				$('#tree', d).css({
					width: pos
				});
				$('#resizer, #main', d).css({
					left: pos
				});
			});

			$(d).on('mousedown touchstart', '#resizer', function(e) {
				var pos = {};
				pos.x = typeof e.originalEvent.touches != 'undefined' && e.originalEvent.touches.length ? e.originalEvent.touches[0].clientX || e.originalEvent.changedTouches[0].clientX : e.clientX;

				$(d.body).addClass('resizer-move');

				$(d).on('mousemove touchmove', function(e) {
					pos.x = typeof e.originalEvent.touches != 'undefined' && e.originalEvent.touches.length ? e.originalEvent.touches[0].clientX || e.originalEvent.changedTouches[0].clientX : e.clientX;

					if(parseInt(pos.x) > 0) {
						$(d.body).addClass('tree-show').removeClass('tree-hide')
					} else {
						pos.x = 0;
						$(d.body).removeClass('tree-show').addClass('resizer-move')
					}

					$('#tree', d).css({
						width: pos.x
					});
					$('#resizer, #main', d).css({
						left: pos.x
					});
				});

				$(d).one('mouseup touchend', function(e) {
					if(typeof e.originalEvent.touches != 'undefined' && e.originalEvent.touches.length) {
						pos.x = e.originalEvent.touches[0].clientX
					} else if(typeof e.originalEvent.changedTouches != 'undefined' && e.originalEvent.changedTouches.length) {
						pos.x = e.originalEvent.changedTouches[0].clientX
					} else {
						pos.x = e.clientX
					}

					$(d).off('mousemove touchmove');
					if(parseInt(pos.x) > 0) {
						$(d.body).removeClass('resizer-move').addClass('tree-show').removeClass('tree-hide')
					} else {
						$(d.body).removeClass('resizer-move').removeClass('tree-show').addClass('tree-hide')
					}
				});

			})
		},
		tree: {
			init: function() {
				modx.tree.rpcNode = null;
				// tree.ca = "open";
				modx.tree.selectedObject = 0;
				modx.tree.selectedObjectDeleted = 0;
				modx.tree.selectedObjectName = "";
				modx.tree._rc = 0; // added to fix onclick body event from closing ctx menu
				modx.tree.currSorterState = "none";

				modx.tree.resizeTree();
				modx.tree.restoreTree();

				$(w).resize(function() {
					modx.tree.resizeTree()
				})
			},
			getWindowDimension: function() {
				var width = 0;
				var height = 0;

				if(typeof(w.innerWidth) == 'number') {
					width = w.innerWidth;
					height = w.innerHeight;
				} else if(d.documentElement &&
					( d.documentElement.clientWidth ||
					d.documentElement.clientHeight )) {
					width = d.documentElement.clientWidth;
					height = d.documentElement.clientHeight;
				}
				else if(d.body &&
					( d.body.clientWidth || d.body.clientHeight )) {
					width = d.body.clientWidth;
					height = d.body.clientHeight;
				}

				return {'width': width, 'height': height};
			},
			reloadtree: function() {
				if($('#buildText').length) {
					$('#buildText').html('<i class="fa fa-info-circle"></i>&nbsp;' + modx.lang.loading_doc_tree);
					$('#buildText').show();
				}
				modx.tree.saveFolderState(); // save folder state
				setTimeout('modx.tree.restoreTree()', 200);
			},
			restoreTree: function() {
				modx.tree.rpcNode = $('#treeRoot').get(0);
				$.get('index.php?a=1&f=nodes&indent=1&parent=0&expandAll=2', function(data) {
					modx.tree.rpcLoadData(data);
				})
			},
			expandTree: function() {
				modx.tree.rpcNode = $('#treeRoot').get(0);
				$.get('index.php?a=1&f=nodes&indent=1&parent=0&expandAll=1', function(data) {
					modx.tree.rpcLoadData(data)
				})
			},
			collapseTree: function() {
				modx.tree.rpcNode = $('#treeRoot').get(0);
				$.get('index.php?a=1&f=nodes&indent=1&parent=0&expandAll=0', function(data) {
					modx.tree.rpcLoadData(data)
				})
			},
			updateTree: function() {
				modx.tree.rpcNode = $('#treeRoot').get(0);
				treeParams = 'a=1&f=nodes&indent=1&parent=0&expandAll=2&dt=' + d.sortFrm.dt.value + '&tree_sortby=' + d.sortFrm.sortby.value + '&tree_sortdir=' + d.sortFrm.sortdir.value + '&tree_nodename=' + d.sortFrm.nodename.value;
				$.get('index.php?' + treeParams, function(data) {
					modx.tree.rpcLoadData(data)
				})
			},
			reloadmenu: function() {
				if(modx.manager_layout == 0) {
					if($('#buildText').length) {
						$('#buildText').html('<i class="fa fa-warning"></i>&nbsp;' + modx.lang.loading_menu);
						$('#buildText').show();
					}
					location.reload();
				}
			},
			resizeTree: function() {
				// get window width/height
				var win = modx.tree.getWindowDimension();

				// set tree height
				$('#treeHolder').css({
					// width: (win['width'] - 20) + 'px',
					height: (win['height'] - $('#treeHolder').offset().top - 6) + 'px',
					overflow: 'auto'
				})
			},
			rpcLoadData: function(response) {
				if(modx.tree.rpcNode != null) {
					modx.tree.rpcNode.innerHTML = typeof response == 'object' ? response.responseText : response;
					modx.tree.rpcNode.style.display = 'block';
					modx.tree.rpcNode.loaded = true;
					if(localStorage.getItem('MODX_lastClickedElement') != undefined) {
						$('#node' + JSON.parse(localStorage.getItem('MODX_lastClickedElement'))[1] + ' > .treeNode').addClass('treeNodeSelected');
					}
					$(d).find("#buildText").html('').hide();
					// check if bin is full
					if(modx.tree.rpcNode.id == 'treeRoot') {
						if($('#binFull').length) modx.tree.showBinFull();
						else modx.tree.showBinEmpty();
					}

					// check if our payload contains the login form :)
					if($('#mx_loginbox').length) {
						// yep! the session has timed out
						modx.tree.rpcNode.innerHTML = '';
						location = 'index.php';
					}
				}
			},
			getFolderState: function() {
				if(modx.openedArray != [0]) {
					oarray = "&opened=";
					for(key in modx.openedArray) {
						if(modx.openedArray[key] == 1) {
							oarray += key + "|";
						}
					}
				} else {
					oarray = "&opened=";
				}
				return oarray;
			},
			saveFolderState: function() {
				$.get('index.php?a=1&f=nodes&savestateonly=1' + modx.tree.getFolderState())
			},
			toggleNode: function(node, indent, parent, expandAll, privatenode) {
				privatenode = (!privatenode || privatenode == '0') ? '0' : '1';
				modx.tree.rpcNode = $(node.parentNode.lastChild).get(0);

				var rpcNodeText;
				var loadText = modx.lang.loading_doc_tree;

				var signImg = $('#s' + parent).get(0);
				var folderImg = $('#f' + parent).get(0);

				if(modx.tree.rpcNode.style.display != 'block') {
					// expand
					if(signImg && signImg.src.indexOf(modx.style.tree_plusnode) > -1) {
						signImg.src = modx.style.tree_minusnode;
						folderImg.innerHTML = (privatenode == '0') ? modx.style.tree_folderopen_new : modx.style.tree_folderopen_secure;
					}

					rpcNodeText = modx.tree.rpcNode.innerHTML;

					if(rpcNodeText == "" || rpcNodeText.indexOf(loadText) > 0) {
						var i, spacer = '';
						for(i = 0; i <= indent + 1; i++) spacer += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
						modx.tree.rpcNode.style.display = 'block';
						//Jeroen set opened
						modx.openedArray[parent] = 1;
						//Raymond:added getFolderState()
						var folderState = modx.tree.getFolderState();
						modx.tree.rpcNode.innerHTML = '<span class="emptyNode" style="white-space:nowrap;">' + spacer + '&nbsp;&nbsp;&nbsp;' + loadText + '...<\/span>';
						$.get('index.php?a=1&f=nodes&indent=' + indent + '&parent=' + parent + '&expandAll=' + expandAll + folderState, function(data) {
							modx.tree.rpcLoadData(data)
						})
					} else {
						modx.tree.rpcNode.style.display = 'block';
						//Jeroen set opened
						modx.openedArray[parent] = 1;
					}
				}
				else {
					// collapse
					if(signImg && signImg.src.indexOf(modx.style.tree_minusnode) > -1) {
						signImg.src = modx.style.tree_plusnode;
						folderImg.innerHTML = (privatenode === '0') ? modx.style.tree_folder_new : modx.style.tree_folder_secure;
					}
					//rpcNode.innerHTML = '';
					modx.tree.rpcNode.style.display = 'none';
					modx.openedArray[parent] = 0;
				}
			},
			setSelected: function(elSel) {
				$('.treeNodeSelected', $('#tree')).removeClass('treeNodeSelected')
				$(elSel).addClass('treeNodeSelected');
			},
			setHoverClass: function(el, dir) {
				if(dir == 1) {
					$(el).addClass('treeNodeHover')
				} else {
					$(el).removeClass('treeNodeHover')
				}
			},
			setCNS: function(n, b) {
				if(b == 1) {
					n.style.backgroundColor = "beige";
				} else {
					n.style.backgroundColor = "";
				}
			},
			unlockElement: function(type, id, domEl) {
				var msg = modx.lockedElementsTranslation.msg.replace('[+id+]', id).replace('[+element_type+]', modx.lockedElementsTranslation['type' + type]);
				if(confirm(msg) == true) {
					$.get('index.php?a=67&type=' + type + '&id=' + id, function(data) {
						if(data == 1) {
							$(domEl).fadeOut();
						}
						else alert(data);
					});
				}
			},
			treeAction: function(e, id, name, treedisp_children) {
				if(tree.ca == "move") {
					try {
						top.main.setMoveValue(id, name);
					} catch(oException) {
						alert(modx.lang.unable_set_parent);
					}
				}
				if(tree.ca == "open" || tree.ca == "") {
					if(id == 0) {
						// do nothing?
						top.main.location.href = "index.php?a=2";
					} else {
						// parent.main.location.href="index.php?a=3&id=" + id + getFolderState(); //just added the getvar &opened=
						var href = '';
						modx.setLastClickedElement(7, id);
						if(treedisp_children == 0) {
							href = "index.php?a=3&r=1&id=" + id + modx.tree.getFolderState();
						} else {
							href = "index.php?a=" + (modx.tree_page_click ? modx.tree_page_click : 27) + "&r=1&id=" + id; // edit as default action
						}
						if(e.shiftKey) {
							w.getSelection().removeAllRanges(); // Remove unnessecary text-selection
							randomNum = Math.floor((Math.random() * 999999) + 1);
							modx.openWindow(href, 'res' + randomNum);
							modx.tree.reloadtree(); // Show updated locks as &r=1 will not work in popup
						} else {
							top.main.location.href = href;
						}
					}
				}
				if(tree.ca == "parent") {
					try {
						top.main.setParent(id, name);
					} catch(oException) {
						alert(modx.lang.unable_set_parent);
					}
				}
				if(tree.ca == "link") {
					try {
						top.main.setLink(id);
					} catch(oException) {
						alert(modx.lang.unable_set_link);
					}
				}
			},
			setActiveFromContextMenu: function(doc_id) {
				$('.treeNodeSelected').removeClass('treeNodeSelected');
				$('#node' + doc_id + '>span').addClass('treeNodeSelected');
			},
			menuHandler: function(action) {
				switch(action) {
					case 1 : // view
						modx.tree.setActiveFromContextMenu(itemToChange);
						top.main.location.href = "index.php?a=3&id=" + itemToChange;
						break;
					case 2 : // edit
						modx.setLastClickedElement(7, itemToChange);
						modx.tree.setActiveFromContextMenu(itemToChange);
						top.main.location.href = "index.php?a=27&id=" + itemToChange;
						break;
					case 3 : // new Resource
						top.main.location.href = "index.php?a=4&pid=" + itemToChange;
						break;
					case 4 : // delete
						if(modx.tree.selectedObjectDeleted) {
							alert("'" + modx.tree.selectedObjectName + "'" + modx.lang.already_deleted)
						} else {
							if(confirm("'" + modx.tree.selectedObjectName + "' \n\n" + modx.lang.confirm_delete_resource + "\n") === true) {
								top.main.location.href = "index.php?a=6&id=" + itemToChange
							}
						}
						break;
					case 5 : // move
						top.main.location.href = "index.php?a=51&id=" + itemToChange
						break;
					case 6 : // new Weblink
						top.main.location.href = "index.php?a=72&pid=" + itemToChange
						break;
					case 7 : // duplicate
						if(confirm(modx.lang.confirm_resource_duplicate) === true) {
							top.main.location.href = "index.php?a=94&id=" + itemToChange
						}
						break;
					case 8 : // undelete
						if(modx.tree.selectedObjectDeleted) {
							if(confirm("'" + modx.tree.selectedObjectName + "' " + modx.lang.confirm_undelete) === true) {
								top.main.location.href = "index.php?a=63&id=" + itemToChange
							}
						} else {
							alert("'" + modx.tree.selectedObjectName + "' " + modx.lang.not_deleted)
						}
						break;
					case 9 : // publish
						if(confirm("'" + modx.tree.selectedObjectName + "' " + modx.lang.confirm_publish) === true) {
							top.main.location.href = "index.php?a=61&id=" + itemToChange
						}
						break;
					case 10 : // unpublish
						if(itemToChange != modx.site_start) {
							if(confirm("'" + modx.tree.selectedObjectName + "' " + modx.lang.confirm_unpublish) === true) {
								top.main.location.href = "index.php?a=62&id=" + itemToChange
							}
						}
						else {
							alert('Document is linked to site_start variable and cannot be unpublished!');
						}
						break;
					case 11 : // sort menu index
						top.main.location.href = "index.php?a=56&id=" + itemToChange
						break;
					case 12 : // preview
						w.open(selectedObjectUrl, 'previeWin'); //re-use 'new' window
						break;

					default :
						alert('Unknown operation command.');
				}
			},
			getScrollY: function() {
				var scrOfY = 0;
				if(typeof(w.pageYOffset) == 'number') {
					//Netscape compliant
					scrOfY = w.pageYOffset;
				} else if(d.body && ( d.body.scrollLeft || d.body.scrollTop )) {
					//DOM compliant
					scrOfY = d.body.scrollTop;
				} else if(d.documentElement &&
					(d.documentElement.scrollTop )) {
					//IE6 standards compliant mode
					scrOfY = d.documentElement.scrollTop;
				}
				return scrOfY;
			},
			showPopup: function(id, title, pub, del, folder, e) {
				var x, y, mnu = $('#mx_contextmenu').get(0);

				if(modx.permission.publish_document == 1) {
					$('#item9').show();
					$('#item10').show();
					if(pub == 1) $('#item9').hide();
					else $('#item10').hide();
				} else {
					if($('#item5') != null) $('#item5').hide();
				}

				if(modx.permission.delete_document == 1) {
					$('#item4').show();
					$('#item8').show();
					if(del == 1) {
						$('#item4').hide();
						$('#item9').hide();
						$('#item10').hide();
					} else {
						$('#item8').hide()
					}
				}
				if(folder == 1) $('#item11').show();
				else $('#item11').hide();

				var bodyHeight = parseInt(d.body.offsetHeight);
				var bodyWidth = parseInt(d.body.offsetWidth);
				x = e.clientX > 0 ? e.clientX : e.pageX;
				if(x + mnu.offsetWidth > bodyWidth) {
					// make sure context menu is within frame
					x = Math.max(x - ((x + mnu.offsetWidth) - bodyWidth + 5), 0);
				}
				y = e.clientY > 0 ? e.clientY : e.pageY;
				y = modx.tree.getScrollY() + (y / 2);
				if(y + mnu.offsetHeight > bodyHeight) {
					// make sure context menu is within frame
					y = y - ((y + mnu.offsetHeight) - bodyHeight + 5);
				}
				itemToChange = id;
				modx.tree.selectedObjectName = title;
				modx.tree.dopopup(x + 5, y);
				e.cancelBubble = true;
				return false;
			},
			dopopup: function(x, y) {
				if(modx.tree.selectedObjectName.length > 20) {
					modx.tree.selectedObjectName = modx.tree.selectedObjectName.substr(0, 20) + "...";
				}
				$('#mx_contextmenu').css({
					left: x + (modx.textdir ? ' - 190' : '') + "px",
					top: y + "px",
					visibility: 'visible'
				});
				$("#nameHolder").html(modx.tree.selectedObjectName);
				modx.tree._rc = 1;
				setTimeout("modx.tree._rc = 0;", 100);
				top.main.onclick = function() {
					modx.tree.hideMenu(1)
				};
				d.onclick = function() {
					modx.tree.hideMenu(1)
				}
			},
			hideMenu: function() {
				if(modx.tree._rc) return false;
				$('#mx_contextmenu').css('visibility', 'hidden');
			},
			showBinFull: function() {
				if($('#Button10').length) {
					$('#Button10').attr('title', modx.lang.empty_recycle_bin)
						.addClass('treeButton')
						.removeClass('treeButtonDisabled')
						.html(modx.style.empty_recycle_bin)
						.click(function() {
							modx.tree.emptyTrash()
						})
				}
			},
			showBinEmpty: function() {
				if($('#Button10').length) {
					$('#Button10').attr('title', modx.lang.empty_recycle_bin_empty)
						.addClass('treeButton')
						.html(modx.style.empty_recycle_bin_empty)
						.off('click')
				}
			},
			emptyTrash: function() {
				if(confirm(modx.lang.confirm_empty_trash) == true) {
					top.main.location.href = "index.php?a=64";
				}
			},
			showSorter: function() {
				if(modx.tree.currSorterState == "none") {
					modx.tree.currSorterState = "block";
					jQuery('#floater').show()
				} else {
					modx.tree.currSorterState = "none";
					jQuery('#floater').hide()
				}
			}
		},
		openWindow: function(url, title, options) {
			if(options == undefined) {
				var ww = screen.width * 0.9,
					wh = screen.height * 0.8,
					wl = (screen.width - ww) / 2,
					wt = (screen.height - wh) / 2;
				options = 'width=' + ww + ',height=' + wh + ',top=' + wt + ',left=' + wl;
			}
			options += ',toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no';
			if(url !== undefined)
				w.open(url, title, options);

			return false;
		}
	});

	$(d).ready(function() {
		modx.stopWork();
		modx.scrollWork();
		modx.init_sideBar();
		modx.mainmenu.init();
		modx.tree.init();
	});

})(jQuery, window, document, undefined);