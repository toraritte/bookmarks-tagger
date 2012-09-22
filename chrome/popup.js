function bookmarksTaggerPopup()
{
	var mThis = this;
	
	this.mPageTitle = '';
	this.mPageUrl   = '';
	this.mPageTags  = [];
	

	/**
	 * Initialize
	 */
	this.initialize = function()
	{
		this.addListeners();
		this.getPageInfo();
	};
	
	
	/**
	 * Add event listeners
	 */
	this.addListeners = function()
	{
		document.addEventListener('DOMContentLoaded', function () {
			$('tags').addEventListener('keyup', function(aEvent) { mThis.listenerTagsKeyUp(aEvent); });
			$('title').addEventListener('keyup', function(aEvent) { mThis.listenerTitleKeyUp(aEvent); });
			$('remove').addEventListener('click', function(aEvent) { mThis.removeBookmark(); });
			$('save').addEventListener('click', function(aEvent) { mThis.saveBookmark(); });
		});
	};
	
	
	/**
	 * Create tags bubbles
	 */
	this.createTagsBubbles = function()
	{
		lTagsBubbles         = $('tags-bubbles');
		lTagsBubblesChildren = document.querySelectorAll('div[id="tags-bubbles"] a');

		for (var i = 0; i < lTagsBubblesChildren.length; i++) {
			lTagsBubblesChildren[i].parentNode.removeChild(lTagsBubblesChildren[i])
		}
		
		for (var j = 0; j < this.mPageTags.length; j++) {
			lTag = document.createElement('a');
			lTag.innerHTML = this.mPageTags[j];
			lTag.addEventListener('click', function(aEvent) { mThis.listenerTagClick(aEvent, this); });
			lTagsBubbles.appendChild(lTag);
		}
	};
	
	
	/**
	 * Input box listener for typing tags
	 */
	this.listenerTagsKeyUp = function(aEvent)
	{
		this.mPageTags = uniqueArray($('tags').value.split(' '));
		this.createTagsBubbles();
		
		switch (aEvent.which) {
			case KEY_ENTER:
				this.saveBookmark();
				break;
		}
	};
	
	
	/**
	 * Input box listener for typing title
	 */
	this.listenerTitleKeyUp = function(aEvent)
	{
		this.mPageTitle = $('title').value;
		
		switch (aEvent.which) {
			case KEY_ENTER:
				$('tags').focus();
				break;
		}
	}
	
	
	/**
	 * Anchor listener for removing tags by clicking on them
	 */
	this.listenerTagClick = function(aEvent, aElement)
	{
		lTag = aElement.innerHTML;
		var lLeftTrim = new RegExp('\\s+' + lTag);
		var lRightTrim = new RegExp(lTag + '\\s+');
		
		$('tags').value = lTags.value.replace(lLeftTrim, '').replace(lRightTrim, '').replace(lTag, '');
		aElement.parentNode.removeChild(aElement);
		
		this.mPageTags = $('tags').value.split(' ');
	};
	
	
	/**
	 * Get page about page loaded on the current tab
	 */
	this.getPageInfo = function()
	{
		chrome.tabs.getSelected(undefined, function(aTab) 
		{
			mThis.mPageUrl   = aTab.url;
			mThis.mPageTitle = aTab.title;

			chrome.extension.sendMessage({ getPageInfo: mThis.mPageUrl }, function(aResponse)
			{
				if (aResponse.status == 'ok') {
					mThis.mPageTitle = aResponse.title;
					mThis.mPageTags  = aResponse.tags;
					
					$('remove').style.display = 'block';
					mThis.createTagsBubbles();
				} else {
					$('remove').style.display = 'none';
				}
				
				$('title').value = mThis.mPageTitle;
				$('tags').value  = mThis.mPageTags.join(' ');
			});
		});
	};

	
	/**
	 * Save bookmark
	 */
	this.saveBookmark = function()
	{
		if (this.mPageTags.length > 0) {
			chrome.extension.sendMessage({ saveBookmark: { url: this.mPageUrl, title: this.mPageTitle, tags: this.mPageTags }}, function(aResponse)
			{
				if (aResponse.status == 'ok') {
					window.close();
				}
			});
		}
	};
	
	
	/**
	 * Remove bookmark
	 */
	this.removeBookmark = function()
	{
		chrome.extension.sendMessage({ removeBookmark: this.mPageUrl }, function(aResponse)
		{
			if (aResponse.status == 'ok') {
				window.close();
			}
		});
	};
}


var lBookmarksTaggerPopup = new bookmarksTaggerPopup();
lBookmarksTaggerPopup.initialize();
