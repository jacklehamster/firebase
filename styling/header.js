if(window==top) {
    window.addEventListener("load",
        function(e) {
            e.currentTarget.removeEventListener(e.type,arguments.callee);
            var loc = window.location.href.split("firebase/")[1].split("/")[0];
            var table = document.createElement("table");
            table.width="100%";
            table.border = 0;
            var tr = document.createElement("tr");
            table.appendChild(tr);
            //  Left cell
            var td = document.createElement("td");
            tr.appendChild(td);
            td.width = "33%";
            td.style.verticalAlign = "top";
            td.innerHTML = '[<a href="..">&lt;&lt; Back to Firebase Projects</a>]'
            + '<br>' + 'source code: <a href="'+loc+'">'+loc+"</a>";
            //  Mid cell
            var td = document.createElement("td");
            tr.appendChild(td);
            td.width = "33%";
            td.align = "center";
            td.style.verticalAlign = "top";
            td.innerHTML = "<h2>"+document.title+"</h2>";
            //  Right cell
            var td = document.createElement("td");
            tr.appendChild(td);
            td.width = "33%";
            td.align = "right";
            td.style.verticalAlign = "top";
            td.innerHTML = '<i><a href="https://twitter.com/jacklehamster">@jacklehamster</a></i>';
            document.body.insertBefore(table,document.body.firstChild);
        });
}