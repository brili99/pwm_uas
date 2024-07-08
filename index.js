function failHandler() {}

$(function () {
  function get_list_kota() {
    $("#modalSelectKota").modal("show");
    $.get(
      "https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/kota.json"
    )
      .done(function (res) {
        $("#formTambahKota select[name=kota]").empty();
        if (typeof res == "string") {
          res = JSON.parse(res);
        }
        $.each(res, function (i, v) {
          $("#formTambahKota select[name=kota]").append(
            `<option value="${v}">${v}</option>`
          );
        });
      })
      .fail(failHandler);
  }
  function get_adzan_bulan_ini(kota) {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    $.get(
      `https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/${kota}/${formattedDate}.json`
    )
      .done(function (res) {
        console.log(res);
      })
      .fail(failHandler);
  }
  $("#btnTambahJadwal").on("click", get_list_kota);
});
