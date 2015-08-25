TrelloPicCard.listSelector = (function($) {

    return function (callback) {
        Trello.get("members/me/boards", { fields: "name", filter: "open" }, function (boards) {
            var currentList = TrelloPicCard.selectedList() | {};

            $prompt = TrelloPicCard.overlayPrompt({
                html: 'Which list should cards be sent to?<hr><div class="boards"></div>', 
                callback: function () {
                    var selectedItem = $prompt.find("input:checked");

                    TrelloPicCard.selectedList({
                        listId: selectedItem.attr("id"),
                        listDisplayName: selectedItem.attr("data-list-name")
                    });

                    callback();
                }, 
                verticalStretch: true});

            $.each(boards, function (ix, board) {
                $board = $("<div>").appendTo($prompt.find(".boards"));

                Trello.get("boards/" + board.id + "/lists", function (lists) {
                    $.each(lists, function (ix, list) {
                        var $div = $("<div>").appendTo($board);

                        $("<input type='radio'>")
                            .attr("id", list.id)
                            .attr("name", "idList")
                            .attr("checked", list.id === currentList.listId)
                            .attr("data-list-name", board.name + " : " + list.name)
                            .appendTo($div);

                        $("<label>")
                            .text(board.name + " : " + list.name)
                            .attr("for", list.id)
                            .appendTo($div);
                    });
                });
            });
        });
    };
})(jQuery);
