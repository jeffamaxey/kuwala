{% macro filter_by_regex(dbt_model, column, regex) %}
    {% set query %}
        SELECT *
        FROM {{ ref(dbt_model) }}
        {% if target.type == 'bigquery' %}
            WHERE REGEXP_CONTAINS({{ column }}, '{{ regex }}')
        {% else %}
            WHERE {{ column }} ~ '{{ regex }}'
        {% endif %}
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}