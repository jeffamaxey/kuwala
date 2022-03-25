{% macro filter_by_keyword(dbt_model, column, keyword) %}
    {% set query %}
        SELECT *
        FROM {{ ref(dbt_model) }}
        WHERE {{ column }} = "{{ keyword }}"
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}