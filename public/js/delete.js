$(document).ready(function(){
    $('body').on('click','.delete',function(){
        var delete_id = this.value;
        // console.log(delete_id);
        $(this).closest('.singleArticle').remove();
        $.ajax({
            type:'DELETE',
            url:'/article/'+delete_id,
            success:function(response){
                console.log(response.message);
            }
        });
    });

});