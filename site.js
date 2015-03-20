var flickr_api_key = "6091b12e48127410a14c91801ed4bb04";
debug_mode = false;
function print_console(message){
	if(debug_mode == true){
		console.log(message);
	}
}
function get_photo_info (photo_id) {
	print_console("El photo ID es "+photo_id)
	var photo_info = {};
	photo_info.id = photo_id;

	var exif_request = $.ajax({
			url: "https://www.flickr.com/services/rest/",
			async: false,
			data: {method:"flickr.photos.getExif", api_key:flickr_api_key, photo_id:photo_id, format:"json"}
	});
	exif_request.always(function (data) {
		var response = data.responseText;
		print_console(JSON.parse(response.substring(14, response.length-1)).photo);
		var data = JSON.parse(response.substring(14, response.length-1)).photo.exif;
		for (i = 0; i < data.length; i++) { 
			if(data[i].tag == "ISO"){
				photo_info.iso = data[i].raw._content;
			}			
			if(data[i].tag == "FNumber"){
				photo_info.aperture = data[i].raw._content;
			}		
			if(data[i].tag == "DateTimeOriginal"){
				photo_info.datetime = data[i].raw._content;
			}		
			if(data[i].tag == "Flash"){
				photo_info.flash = data[i].raw._content;
			}		
			if(data[i].tag == "FocalLength"){
				photo_info.focal = data[i].raw._content;
			}	
			if(data[i].tag == "Model"){
				photo_info.camera = data[i].raw._content;
			}
			if(data[i].tag == "ExposureTime"){
				photo_info.exposure = data[i].raw._content;
			}
		};
	});

	var info_request = $.ajax({
			url: "https://www.flickr.com/services/rest/",
			async: false,
			data: {method:"flickr.photos.getInfo", api_key:flickr_api_key, photo_id:photo_id, format:"json"}
	});
	info_request.always(function (data) {
		var response = data.responseText;
		var data = JSON.parse(response.substring(14, response.length-1)).photo;
			photo_info.title = data.title._content;
			photo_info.description = data.description._content;
			photo_info.tags = [];
			for (i = 0; i < data.tags.tag.length; i++) { 
				photo_info.tags.push(data.tags.tag[i]._content);
			}


		
	});


	var image_request = $.ajax({
			url: "https://www.flickr.com/services/rest/",
			async:false,
			data: {method:"flickr.photos.getSizes", api_key:flickr_api_key, photo_id:photo_id, format:"json"}
	});

	image_request.always(function (data) {
		var response = data.responseText;
		var size = JSON.parse(response.substring(23, response.length-14)).size.length;
		$.each(JSON.parse(response.substring(23, response.length-14)).size, function (i3, val3) {
			if(val3.label == "Large"){
			photo_info.large = val3.source;
			}

			if(val3.label == "Medium"){
			photo_info.medium = val3.source;
			}

			if(val3.label == "Small"){
			photo_info.small = val3.source;
			}

		});
	});
	return photo_info;

}

function get_collections (user_id, per_page, page) {
var collections = [];
	var collection_request = $.ajax({
		url: "https://www.flickr.com/services/rest/",
		async: false,
		data: {method:"flickr.photosets.getList", api_key:flickr_api_key, user_id: user_id, page:page, per_page:per_page, format:"json"}
	});

	collection_request.always(function (data) {
			var response = data.responseText;

			$.each(JSON.parse(response.substring(14, response.length-1)).photosets.photoset, function (i, val) {
				print_console(val)
				var collection_info = {};

				collection_info.id = val.id;
				collection_info.title = val.title._content;
				collection_info.items = val.photos;
				collection_info.photos = [];

	 			// $("#collections").append('<li id="collection_'+val.id+'">'+val.title._content+' ('+val.photos+' fotos)<ul id="photos_'+val.id+'"></ul></li>')
				

				var photos_request = $.ajax({
						url: "https://www.flickr.com/services/rest/",
						async:false,
						data: {method:"flickr.photosets.getPhotos", api_key:flickr_api_key, user_id: "62981203@N02", photoset_id:val.id, format:"json"}
				});

				photos_request.always(function (data) {
					var response = data.responseText;

					$.each(JSON.parse(response.substring(14, response.length-1)).photoset.photo, function (i, val2) {
						$("#collection_"+val.id+" #photos_"+val.id).append("<li id='photo_"+val2.id+"''>"+val2.title+"</li>")
						print_console(val2)
						collection_info.photos.push(get_photo_info(val2.id))
						print_console(get_photo_info(val2.id));
					});
				});
				collections.push(collection_info);


			});

	// 	collections = data.collections;
	// 	random_array(collections)
	// 	print_console(collections);
	// 	$.each(collections, function (i, val) {
	// 			$("#collections").append('<li id="collection_'+val.id+'">'+val.title+' ('+val.total_items+' fotos)</a>')
	// 	})
})
return collections;
}
var collections;
function init (info) {
	print_console("hi");
	collections = get_collections("62981203@N02", "2", "1");

}

$(document).on("ready", init);
