export function ativarDragDrop(
  container
) {

  const draggables =
    container.querySelectorAll(
      ".draggable-item"
    );

  const dropzones =
    container.querySelectorAll(
      ".dropzone"
    );

  draggables.forEach(item => {

    item.addEventListener(
      "dragstart",
      e => {

        e.dataTransfer.setData(
          "text/plain",
          item.dataset.key
        );

        e.dataTransfer.setData(
          "text/html",
          item.outerHTML
        );
      }
    );
  });

  dropzones.forEach(zone => {

    zone.addEventListener(
      "dragover",
      e => e.preventDefault()
    );

    zone.addEventListener(
      "drop",
      e => {

        e.preventDefault();

        const key =
          e.dataTransfer.getData(
            "text/plain"
          );

        const html =
          e.dataTransfer.getData(
            "text/html"
          );

        zone.innerHTML = "";

        zone.insertAdjacentHTML(
          "beforeend",
          html
        );

        zone.dataset.selected =
          key;
      }
    );
  });
}